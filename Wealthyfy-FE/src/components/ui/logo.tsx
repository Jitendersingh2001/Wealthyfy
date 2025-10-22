const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img 
      src="/favicon.png" 
      alt="WealthyFy Logo" 
      className="h-7 w-6"
      {...props}
    />
  );
};

export default Logo;