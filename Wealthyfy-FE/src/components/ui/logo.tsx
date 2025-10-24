const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img 
      src="/favicon.png" 
      alt="WealthyFy Logo" 
      className="h-9 w-7"
      {...props}
    />
  );
};

export default Logo;