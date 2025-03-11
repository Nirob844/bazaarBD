import BannerAds from "@/components/home/BannerAds";
import BestDeals from "@/components/home/BestDeals";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import WhyChooseUs from "@/components/home/WhyChooseUs";

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
