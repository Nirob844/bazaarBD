import Categories from "@/components/homepage/Categories";
import FeaturedProducts from "@/components/homepage/FeaturedProducts";
import Hero from "@/components/homepage/Hero";

const Home = () => {
  return (
    <div>
      <div>
        <Hero />
        <Categories />
        <FeaturedProducts />
      </div>
    </div>
  );
};

export default Home;
