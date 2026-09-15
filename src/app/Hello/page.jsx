export const metadata = {
  title: {
    default: "Hello",
    template: "%s | powered by Next.js",
  },
  description: "Helloのページです。", 
};

export default function Hello() {
  return (
    <div className="hello">hello</div>
  );
}