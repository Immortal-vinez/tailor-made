import { CategoryPage } from "@/components/CategoryPage";

export const metadata = {
  title: "Children's Collection | Oneway",
  description: "Fun, comfortable, and durable clothing for your little ones. Bright colors and playful designs they'll love to wear.",
};

export default function ChildrenPage() {
  return (
    <CategoryPage
      category="children"
      title="Children"
      subtitle="Fun, comfortable, and durable clothing for your little ones. Bright colors and playful designs they'll love to wear."
    />
  );
}
