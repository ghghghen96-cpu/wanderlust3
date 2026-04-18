import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp, doc, setDoc, updateDoc, increment, onSnapshot, getDoc, deleteDoc, orderBy } from "firebase/firestore";

import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";

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
export const storage = getStorage(app);
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
    console.log("[Firebase] Starting publishToMarketplace with data:", templateData);
    
    try {
        // 필수 필드 체크 (Backend-side validation)
        const requiredFields = ['creatorUid', 'title', 'price', 'thumbnail', 'itinerary'];
        for (const field of requiredFields) {
            if (!templateData[field]) {
                const errMsg = `Missing required field: ${field}`;
                console.error("[Firebase] Validation failed:", errMsg);
                throw new Error(errMsg);
            }
        }

        const docRef = await addDoc(collection(db, "Marketplace_Templates"), {
            ...templateData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "Active",
            is_published: true,   // 마켓플레이스 노출 여부 (비공개 시 false로 변경)
            reviews: 0,
            rating: 0,
            purchaseCount: 0,
        });

        console.log("[Firebase] Template successfully added. ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("[Firebase] Critical error in publishToMarketplace:", error);
        throw error;
    }
};

// 썸네일 이미지 Storage 업로드
export const uploadThumbnailToStorage = async (dataUrl, uid) => {
    if (!dataUrl || !dataUrl.startsWith("data:image")) return dataUrl;
    try {
        const uniqueName = `thumbnails/${uid}_${Date.now()}.jpg`;
        const storageRef = ref(storage, uniqueName);
        console.log("Uploading thumbnail to storage:", uniqueName);
        await uploadString(storageRef, dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        console.log("Thumbnail uploaded successfully:", downloadUrl);
        return downloadUrl;
    } catch (error) {
        console.error("Error uploading thumbnail:", error);
        throw new Error('이미지 업로드에 실패했습니다. (Storage Error)');
    }
};

// 사용자가 게시한 마켓플레이스 템플릿 목록 가져오기 (상태 무관, 클라이언트 정렬)
export const getUserPublishedTemplates = async (uid) => {
    if (!uid) return [];
    try {
        // orderBy 없이 단순 where 쿼리 - 복합 인덱스 불필요
        const q = query(
            collection(db, "Marketplace_Templates"),
            where("creatorUid", "==", uid)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
        // 클라이언트에서 최신순 정렬
        return results.sort((a, b) => {
            const aTime = a.createdAt?.seconds ?? 0;
            const bTime = b.createdAt?.seconds ?? 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error("Error fetching user templates:", error);
        return []; // throw 대신 빈 배열 반환으로 앱 크래시 방지
    }
};

// 마켓플레이스 템플릿 정보 수정 (가격, 설명, 썸네일 등)
export const updateMarketplaceTemplate = async (templateId, updates) => {
    if (!templateId) throw new Error("Template ID is required");
    try {
        const docRef = doc(db, "Marketplace_Templates", templateId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log(`[Firebase] Template updated: ${templateId}`);
        return true;
    } catch (error) {
        console.error("[Firebase] Error updating template:", error);
        throw error;
    }
};

// 마켓플레이스에서 비공개 처리 (완전 삭제 대신 상태만 변경)
export const unpublishMarketplaceTemplate = async (templateId) => {
    if (!templateId) throw new Error("Template ID is required");
    try {
        const docRef = doc(db, "Marketplace_Templates", templateId);
        await updateDoc(docRef, {
            status: "Inactive",
            is_published: false,
            updatedAt: serverTimestamp()
        });
        console.log(`[Firebase] Template unpublished: ${templateId}`);
        return true;
    } catch (error) {
        console.error("[Firebase] Error unpublishing template:", error);
        throw error;
    }
};

// 마켓플레이스 템플릿 삭제 (Storage 이미지 포함)
export const deleteMarketplaceTemplate = async (templateId, thumbnailUrl) => {
    if (!templateId) throw new Error("Template ID is required");
    
    try {
        // 1. Firestore 문서 삭제
        await deleteDoc(doc(db, "Marketplace_Templates", templateId));
        console.log(`[Firebase] Deleted Firestore document: ${templateId}`);

        // 2. Storage 이미지 삭제 (필요한 경우)
        if (thumbnailUrl && thumbnailUrl.includes("firebasestorage.googleapis.com")) {
            try {
                // URL에서 ref 생성하여 삭제
                const imageRef = ref(storage, thumbnailUrl);
                await deleteObject(imageRef);
                console.log(`[Firebase] Deleted storage object for URL: ${thumbnailUrl}`);
            } catch (storageError) {
                // 스토리지 삭제 실패는 로깅만 하고 전체 프로세스가 실패한 것으로 간주하진 않음 (이미 문서가 삭제되었으므로)
                console.warn("[Firebase] Failed to delete storage object:", storageError);
            }
        }
        
        return true;
    } catch (error) {
        console.error("[Firebase] Error deleting template:", error);
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
            creatorUid: plan.creatorId || plan.creatorUid || null, // 판매 내역 조회를 위한 상위 필드 추가
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

// 특정 사용자가 판매한 내역 조회 (판매자 관점)
export const getSalesHistory = async (creatorUid) => {
    if (!creatorUid) return [];
    try {
        const q = query(collection(db, "My_Library"), where("creatorUid", "==", creatorUid));
        const querySnapshot = await getDocs(q);
        const sales = [];
        querySnapshot.forEach((doc) => {
            sales.push({ docId: doc.id, ...doc.data() });
        });
        // 일시 기준 정렬 (클라이언트 단에서 정렬하거나 쿼리 인덱스 필요)
        return sales.sort((a, b) => b.purchasedAt?.seconds - a.purchasedAt?.seconds);
    } catch (error) {
        console.error("Error fetching sales history:", error);
        return [];
    }
};

export const getMarketplaceTemplates = async () => {
    try {
        const q = query(collection(db, "Marketplace_Templates"), where("status", "==", "Active"));
        const querySnapshot = await getDocs(q);
        const templates = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // is_published 필드가 명시적으로 false인 경우 제외 (이중 방어)
            if (data.is_published !== false) {
                templates.push({ id: doc.id, ...data });
            }
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
