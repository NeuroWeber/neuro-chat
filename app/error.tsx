'use client'
import { Card } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default function Error() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-25">
        <Card className="bg-dark-secondary border-info border justify-center items-center rounded-4 p-3 flex flex-column">
          <XIcon size={50} className="bg-danger rounded"/>
          <p className="mb-6 font-bold text-xl">An error occured in the page</p>
          <button className="btn btn-primary text-lg" onClick={()=>redirect('/')}>reload page</button>
        </Card>
      </div>
    </div>
  );
}
