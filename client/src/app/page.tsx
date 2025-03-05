import BannerAds from "@/components/homepage/BannerAds";
import BestDeals from "@/components/homepage/BestDeals";
import Categories from "@/components/homepage/Categories";
import FeaturedProducts from "@/components/homepage/FeaturedProducts";
import Hero from "@/components/homepage/Hero";
import Testimonials from "@/components/homepage/Testimonials";
import WhyChooseUs from "@/components/homepage/WhyChooseUs";

const Home = () => {
  return (
    <div>
      <div>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <BestDeals />
        <BannerAds />
        <Testimonials />
        <WhyChooseUs />
      </div>
    </div>
  );
};

export default Home;
