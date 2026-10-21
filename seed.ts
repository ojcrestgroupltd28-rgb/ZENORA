import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const categories = [
    ["Electronics","electronics"],["Fashion","fashion"],["Beauty","beauty"],["Home & Living","home-living"],
    ["Phones & Tablets","phones-tablets"],["Computers","computers"],["Gaming","gaming"],["Sports","sports"]
  ];
  const catMap = new Map<string,string>();
  for (const [name,slug] of categories) {
    const c = await prisma.category.upsert({ where:{slug}, update:{name}, create:{name,slug} });
    catMap.set(name,c.id);
  }
  const items = [
    {name:"Aurora Wireless Headphones",slug:"aurora-wireless-headphones",priceKobo:4890000,compareAtPriceKobo:6500000,category:"Electronics",imageUrl:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",stock:25,featured:true,brand:"Aurora"},
    {name:"Nova Smart Watch Series 8",slug:"nova-smart-watch-series-8",priceKobo:7250000,compareAtPriceKobo:8900000,category:"Electronics",imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",stock:17,featured:true,brand:"Nova"},
    {name:"Everyday Minimal Sneakers",slug:"everyday-minimal-sneakers",priceKobo:3850000,category:"Fashion",imageUrl:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",stock:32,featured:true,brand:"Zenora Edit"},
    {name:"Studio Mini Bluetooth Speaker",slug:"studio-mini-bluetooth-speaker",priceKobo:2990000,compareAtPriceKobo:3600000,category:"Electronics",imageUrl:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85",stock:40,featured:false,brand:"Studio"},
    {name:"Signature Leather Crossbody",slug:"signature-leather-crossbody",priceKobo:5600000,category:"Fashion",imageUrl:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85",stock:12,featured:true,brand:"Signature"},
    {name:"Glow Essentials Skincare Set",slug:"glow-essentials-skincare-set",priceKobo:2470000,compareAtPriceKobo:3100000,category:"Beauty",imageUrl:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85",stock:50,featured:false,brand:"Glow"},
    {name:"Modern Ceramic Table Lamp",slug:"modern-ceramic-table-lamp",priceKobo:4190000,category:"Home & Living",imageUrl:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85",stock:10,featured:false,brand:"Form"},
    {name:"Everyday Carry Backpack",slug:"everyday-carry-backpack",priceKobo:4490000,compareAtPriceKobo:5200000,category:"Fashion",imageUrl:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",stock:21,featured:true,brand:"Carry"}
  ];
  for (const p of items) {
    const {category,...data} = p;
    await prisma.product.upsert({where:{slug:data.slug},update:{...data,categoryId:catMap.get(category)},create:{...data,categoryId:catMap.get(category)}});
  }
}
main().finally(()=>prisma.$disconnect());
