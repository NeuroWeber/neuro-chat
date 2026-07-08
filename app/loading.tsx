import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse text-white flex-row flex justify-center items-center">
      <p className="display-3 text-center">Loading Page</p>
      <Spinner className="scale-[10] text-blue-500"/>
    </div>
  );
}
