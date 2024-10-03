"use client"
import { useData } from "../context/DataContext";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    // route to admin/manageTasks if user is admin or else to the dashboard
    router.push("admin/manageTasks");

    return (
        <main>
        </main >
    );
}


