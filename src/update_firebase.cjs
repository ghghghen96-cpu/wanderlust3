const fs = require('fs');
let content = fs.readFileSync('src/firebase.js', 'utf8');

const replacement = `
export const recordPurchase = async (uid, plan) => {
    try {
        const docRef = await addDoc(collection(db, "purchased_items"), {
            uid: uid,
            templateId: plan.id || null,
            planData: plan,
            purchasedAt: serverTimestamp(),
        });

        if (plan.creatorUid && plan.price) {
            const earningsRef = doc(db, "user_earnings", plan.creatorUid);
            const earningsSnap = await getDoc(earningsRef);
            
            if (earningsSnap.exists()) {
                await updateDoc(earningsRef, {
                    currentBalance: increment(plan.price),
                    totalEarnings: increment(plan.price),
                    templatesSold: increment(1),
                    updatedAt: serverTimestamp()
                });
            } else {
                await setDoc(earningsRef, {
                    currentBalance: plan.price,
                    totalEarnings: plan.price,
                    withdrawableAmount: 0,
                    templatesSold: 1,
                    updatedAt: serverTimestamp()
                });
            }
        }

        if (plan.id) {
            const templateRef = doc(db, "marketplace_templates", plan.id);
            const templateSnap = await getDoc(templateRef);
            if (templateSnap.exists()) {
                await updateDoc(templateRef, {
                    purchaseCount: increment(1)
                });
            }
        }

        return docRef.id;
    } catch (error) {
        console.error("Error recording purchase:", error);
        throw error;
    }
};

export const getUserPublishedTemplates = async (uid) => {
    try {
        const q = query(
            collection(db, "marketplace_templates"),
            where("creatorUid", "==", uid),
            where("status", "==", "active")
        );
        const querySnapshot = await getDocs(q);
        const templates = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() });
        });
        return templates;
    } catch (error) {
        console.error("Error fetching published templates:", error);
        return [];
    }
};

export const getUserEarnings = async (uid) => {
    try {
        const earningsRef = doc(db, "user_earnings", uid);
        const earningsSnap = await getDoc(earningsRef);
        
        if (earningsSnap.exists()) {
            return earningsSnap.data();
        } else {
            return {
                currentBalance: 0,
                totalEarnings: 0,
                withdrawableAmount: 0,
                templatesSold: 0
            };
        }
    } catch (error) {
        console.error("Error fetching user earnings:", error);
        return {
            currentBalance: 0,
            totalEarnings: 0,
            withdrawableAmount: 0,
            templatesSold: 0
        };
    }
};
`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('export const recordPurchase'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('export const getUserPurchases'));

if (startIdx !== -1 && endIdx !== -1) {
    const p1 = lines.slice(0, startIdx).join('\n');
    const p2 = lines.slice(endIdx).join('\n');
    content = p1 + replacement + '\n' + p2;
}

fs.writeFileSync('src/firebase.js', content, 'utf8');
