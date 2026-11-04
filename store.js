(() => {
  const cfg = window.STORE_CONFIG || {};
  const configured = cfg.supabaseUrl && cfg.supabaseAnonKey && !cfg.supabaseUrl.includes("PASTE_") && !cfg.supabaseAnonKey.includes("PASTE_");
  const client = configured && window.supabase ? window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey) : null;
  const list = document.getElementById("products");
  const count = document.getElementById("product-count");
  let products = [];
  const money = cents => "$" + (Number(cents || 0)/100).toFixed(2);
  function esc(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function render(){
    count.textContent = products.length ? products.length + (products.length === 1 ? " item" : " items") : "";
    if(!products.length){list.innerHTML='<div class="empty">No prints are listed yet. Check back soon.</div>';return;}
    list.innerHTML = products.map(p => '<article class="product"><div class="product-image">'+(p.image_url?'<img src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'" loading="lazy">':'<span class="placeholder">Product photo</span>')+'</div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description || "Made to order.")+'</p><div class="product-bottom"><span class="price">'+money(p.price_cents)+'</span><button type="button" data-order="'+esc(p.id)+'">Request</button></div></article>').join("");
    list.querySelectorAll("[data-order]").forEach(b=>b.addEventListener("click",()=>openOrder(b.dataset.order)));
  }
  async function load(){
    if(!client){list.innerHTML='<div class="empty">The shop is being set up. Please check back soon.</div>';return;}
    const {data,error}=await client.from("products").select("id,name,description,price_cents,image_url").eq("active",true).order("created_at",{ascending:false});
    if(error){list.innerHTML='<div class="empty">Prints could not load right now. Please try again later.</div>';return;}
    products=data||[];render();
  }
  const modal=document.getElementById("order-modal"), form=document.getElementById("order-form"), status=document.getElementById("order-status"), send=document.getElementById("send-order");
  function openOrder(id){document.getElementById("order-product-id").value=id;status.textContent="This sends a request, not an automatic purchase.";modal.classList.remove("hidden");}
  document.getElementById("close-order").addEventListener("click",()=>modal.classList.add("hidden"));
  form.addEventListener("submit",async e=>{
    e.preventDefault();if(!client){status.textContent="The order system is not configured yet.";return;}
    const product=products.find(p=>p.id===document.getElementById("order-product-id").value);if(!product)return;
    send.disabled=true;status.textContent="Sending…";
    const payload={customer_name:document.getElementById("customer-name").value.trim(),customer_contact:document.getElementById("customer-contact").value.trim(),product_id:product.id,product_name:product.name,notes:document.getElementById("order-notes").value.trim()};
    try{
      const {data,error}=await client.functions.invoke("submit-order",{body:payload});
      if(error)throw error;
      status.textContent="Request sent. Thanks!";form.reset();
    }catch(err){status.textContent="Could not send the request. Please email landon.luper@icloud.com instead.";console.error(err);}
    finally{send.disabled=false;}
  });
  load();
})();