import { collection, onSnapshot, doc, setDoc, getDoc, deleteDoc, writeBatch, query, limit } from 'firebase/firestore';
<truncated 5221 bytes>
    const servicesQuery = query(collection(db, 'services'), limit(1000));
import { toast } from '../utils/toast';
    // Added a generous limit(1000) safety cap to prevent browser lockup on massive datasets
    const clientsQuery = query(collection(db, 'clients'), limit(1000));