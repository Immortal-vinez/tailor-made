import { CategoryPage } from "@/components/CategoryPage";

export const metadata = {
  title: "Men's Collection | Nyembo Designs",
  description: "Discover our collection of stylish and comfortable men's clothing. From casual to formal, find the perfect fit.",
};

export default function MenPage() {
  return (
    <CategoryPage
      category="men"
      title="Men"
      subtitle="Discover our collection of stylish and comfortable men's clothing. From casual to formal, find the perfect fit for every occasion."
    />
  );
}
