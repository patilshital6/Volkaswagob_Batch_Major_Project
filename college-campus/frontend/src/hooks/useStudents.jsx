import { useEffect, useMemo, useState } from "react";


export const useStudents = () => {
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);


useEffect(() => {
const fetchStudents = async () => {
try {
setLoading(true);
setError(null);


const response = await fetch("/api/students");
if (!response.ok) throw new Error("Failed to fetch students");


const data = await response.json();
setStudents(data);
} catch (err) {
console.error("Error fetching students:", err);
setError(err.message);
} finally {
setLoading(false);
}
};


fetchStudents();
}, []);


// ✅ Map for quick lookup: id -> student
const studentMap = useMemo(() => {
const map = new Map();
students.forEach((s) => map.set(s._id, s));
return map;
}, [students]);


return { students, studentMap, loading, error };
};