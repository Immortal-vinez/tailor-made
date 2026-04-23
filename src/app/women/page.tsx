import { CategoryPage } from "@/components/CategoryPage";

export const metadata = {
  title: "Women's Collection | Nyembo Designs",
  description: "Explore our elegant women's collection featuring the latest trends in fashion. Quality pieces that express your unique style.",
};

export default function WomenPage() {
  return (
    <CategoryPage
      category="women"
      title="Women"
      subtitle="Explore our elegant women's collection featuring the latest trends in fashion. Quality pieces that express your unique style."
    />
  );
}
