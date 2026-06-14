import { redirect } from "next/navigation";

// `/pricing` previously shipped a second, conflicting price list ($0/$49/$299 with an
// unbacked "money-back guarantee"). `/membership` is the single source of truth.
export default function PricingPage() {
  redirect("/membership");
}
