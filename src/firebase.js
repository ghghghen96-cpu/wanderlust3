import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc, updateDoc, increment, onSnapshot, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBwR9DgMXq1Iwx8vnqiB3GYbD5ikJ5r4Uw",
    authDomain: "wanderlust-ai-planner-99.firebaseapp.com",
    projectId: "wanderlust-ai-planner-99",
    storageBucket: "wanderlust-ai-planner-99.firebasestorage.app",
    messagingSenderId: "698329960097",
    appId: "1:698329960097:web:3887b6e4cf5dc55f306ae0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

// 마켓플레이스에 일정 템플릿 등록
export const publishToMarketplace = async (templateData) => {
    try {
        const docRef = await addDoc(collection(db, "Marketplace_Templates"), {
            ...templateData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "Active",
            reviews: 0,
            rating: 0,
            purchaseCount: 0,
        });
        return docRef.id;
    } catch (error) {
        console.error("Error publishing to marketplace:", error);
        throw error;
    }
};

// ─── 사용자 수익 통계 (User_Earnings) ────────────────────────────────────────────────
export const listenToUserEarnings = (uid, callback) => {
    if (!uid) return null;
    const docRef = doc(db, "User_Earnings", uid);
    
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            // 문서가 없으면 초기 데이터 구조 넘겨줌
            callback({
                currentBalance: 0,
                totalEarnings: 0,
                templatesSold: 0
            });
        }
    }, (error) => {
        console.error("Earnings subscribe error:", error);
    });
};

export const initializeUserEarnings = async (uid) => {
    if (!uid) return;
    const docRef = doc(db, "User_Earnings", uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        await setDoc(docRef, {
            currentBalance: 0,
            totalEarnings: 0,
            templatesSold: 0,
            updatedAt: serverTimestamp()
        });
    }
};

// 템플릿 구매 시 원작자 수익 올려주는 함수
export const updateCreatorEarnings = async (creatorUid, amount) => {
    if (!creatorUid) return;
    try {
        const docRef = doc(db, "User_Earnings", creatorUid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                currentBalance: increment(amount),
                totalEarnings: increment(amount),
                templatesSold: increment(1),
                updatedAt: serverTimestamp()
            });
        } else {
            // 문서가 없으면 새로 생성하며 수익 증가
            await setDoc(docRef, {
                currentBalance: amount,
                totalEarnings: amount,
                templatesSold: 1,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error updating creator earnings:", error);
    }
};

// ─── 마켓플레이스 구매 로직 ────────────────────────────────────────────────────────
export const recordPurchase = async (uid, plan) => {
    try {
        const docRef = await addDoc(collection(db, "My_Library"), {
            uid: uid,
            templateId: String(plan.id),      // 항상 문자열로 저장 (타입 통일)
            paymentId: plan.paymentId || null, // 포트원 V2 결제 ID
            orderId: plan.orderId || null,     // 내부 주문 ID
            paidAmount: plan.paidAmount || plan.price,
            paidCurrency: plan.paidCurrency || 'USD',
            planData: plan,
            purchasedAt: serverTimestamp(),
        });
        
        // 원작자(creatorId)가 있다면 수익 80% / 20% 분배 연동
        if ((plan.creatorId || plan.creatorUid) && plan.price) {
            const price = Number(plan.price);
            const creatorShare = price * 0.8;
            const platformShare = price * 0.2;
            const targetCreatorUid = plan.creatorId || plan.creatorUid;

            // 판매자(크리에이터)에게 80% 수익 추가
            await updateCreatorEarnings(targetCreatorUid, creatorShare);

            // 플랫폼 수익 계정에 20% 추가 (별도의 컬렉션: Platform_Earnings)
            const platformRef = doc(db, "Platform_Earnings", "monthly");
            const platformSnap = await getDoc(platformRef);
            if (platformSnap.exists()) {
                await updateDoc(platformRef, {
                    totalRevenue: increment(platformShare),
                    updatedAt: serverTimestamp()
                });
            } else {
                await setDoc(platformRef, {
                    totalRevenue: platformShare,
                    updatedAt: serverTimestamp()
                });
            }
        }

        return docRef.id;
    } catch (error) {
        console.error("Error recording purchase:", error);
        throw error;
    }
};

export const getUserPurchases = async (uid) => {
    try {
        const q = query(collection(db, "My_Library"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        const purchases = [];
        querySnapshot.forEach((doc) => {
            purchases.push({ docId: doc.id, ...doc.data() });
        });
        return purchases;
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return [];
    }
};

export const getMarketplaceTemplates = async () => {
    try {
        const q = query(collection(db, "Marketplace_Templates"), where("status", "==", "Active"));
        const querySnapshot = await getDocs(q);
        const templates = [];
        querySnapshot.forEach((doc) => {
            templates.push({ id: doc.id, ...doc.data() });
        });
        return templates;
    } catch (error) {
        console.error("Error fetching marketplace templates:", error);
        return [];
    }
};

// ─── 출금 신청 로직 (Payout) ────────────────────────────────────────────────────────
export const requestPayout = async (uid, amount, bankInfo) => {
    try {
        // 1. 수익 잔액 차감
        const userRef = doc(db, "User_Earnings", uid);
        await updateDoc(userRef, {
            currentBalance: increment(-amount),
            updatedAt: serverTimestamp()
        });

        // 2. 출금 요청 기록 생성
        const payoutRef = await addDoc(collection(db, "Payout_Requests"), {
            uid: uid,
            amount: amount,
            bankInfo: bankInfo, // { bankName, accountNumber, accountHolder }
            status: "Pending Payout",
            requestedAt: serverTimestamp()
        });

        return payoutRef.id;
    } catch (error) {
        console.error("Error requesting payout:", error);
        throw error;
    }
};
