const { scrapePrice } = require('./scraper/scrapeHelper');

(async () => {
  const url = 'https://www.amazon.in/Parle-g-Original-Glucose-Biscuit-800g/dp/B0118L9WXK?pd_rd_w=Bl4AB&content-id=amzn1.sym.b312cd33-8329-473f-8718-8eebf9382386&pf_rd_p=b312cd33-8329-473f-8718-8eebf9382386&pf_rd_r=9JKXK6QT02ZCVHC1JKWH&pd_rd_wg=TURRl&pd_rd_r=21df8ac3-7f71-480f-9458-2b43321e0a54&pd_rd_i=B0118L9WXK&fpw=alm&almBrandId=ctnow&ref_=pd_alm_fs_mr_dsk_cp_4859498031_ai_4859750031_2_1_i&th=1'; // replace with real product URL
  const result = await scrapePrice(url);
  console.log(result);
})();
