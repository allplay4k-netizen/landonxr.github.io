(() => {
 const cfg=window.STORE_CONFIG||{}, ready=cfg.supabaseUrl&&!cfg.supabaseUrl.includes("PASTE_")&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes("PASTE_");
 const client=ready&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
 const login=document.getElementById("login-panel"),dash=document.getElementById("dashboard"),loginStatus=document.getElementById("login-status"),form=document.getElementById("product-form"),status=document.getElementById("product-status"),list=document.getElementById("admin-products");
 let currentUser=null,items=[];
 function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 function say(el,msg){el.textContent=msg;}
 async function gate(){
  if(!client){say(loginStatus,"Add your Supabase project URL and anon key to config.js first.");return;}
  const {data}=await client.auth.getSession();if(data.session)await checkAdmin(data.session.user);
 }
 async function checkAdmin(user){
  const {data,error}=await client.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
  if(error||!data){await client.auth.signOut();login.classList.remove("hidden");dash.classList.add("hidden");say(loginStatus,"This account is not authorized as a store admin.");return;}
  currentUser=user;login.classList.add("hidden");dash.classList.remove("hidden");await loadItems();
 }
 document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();if(!client)return; say(loginStatus,"Signing in…");const {data,error}=await client.auth.signInWithPassword({email:document.getElementById("email").value,password:document.getElementById("password").value});if(error){say(loginStatus,"Sign-in failed. Check your details.");return;}await checkAdmin(data.user);});
 document.getElementById("signout").addEventListener("click",async()=>{await client.auth.signOut();location.reload();});
 async function loadItems(){
  const {data,error}=await client.from("products").select("*").order("created_at",{ascending:false});if(error){list.textContent="Could not load products.";return;}items=data||[];
  list.innerHTML=items.length?items.map(p=>'<div class="admin-item"><div><strong>'+esc(p.name)+'</strong><small>$'+(p.price_cents/100).toFixed(2)+' · '+(p.active?'Visible':'Hidden')+'</small></div><div class="actions"><button class="secondary" data-edit="'+p.id+'">Edit</button><button class="secondary" data-delete="'+p.id+'">Delete</button></div></div>').join(""):'<p class="muted">No products yet.</p>';
  list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(b.dataset.edit));list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>remove(b.dataset.delete));
 }
 function reset(){form.reset();document.getElementById("product-id").value="";document.getElementById("product-active").checked=true;document.getElementById("editor-title").textContent="Add a product";document.getElementById("save-product").textContent="Save product";document.getElementById("cancel-edit").classList.add("hidden");}
 function edit(id){const p=items.find(x=>x.id===id);if(!p)return;document.getElementById("product-id").value=p.id;document.getElementById("product-name").value=p.name;document.getElementById("product-description").value=p.description||"";document.getElementById("product-price").value=(p.price_cents/100).toFixed(2);document.getElementById("product-active").checked=p.active;document.getElementById("editor-title").textContent="Edit product";document.getElementById("save-product").textContent="Update product";document.getElementById("cancel-edit").classList.remove("hidden");say(status,"");}
 document.getElementById("cancel-edit").onclick=reset;
 async function remove(id){if(!confirm("Delete this product?"))return;const {error}=await client.from("products").delete().eq("id",id);if(error){say(status,"Could not delete product.");return;}await loadItems();}
 form.addEventListener("submit",async e=>{
  e.preventDefault();if(!currentUser)return;const id=document.getElementById("product-id").value,name=document.getElementById("product-name").value.trim(),description=document.getElementById("product-description").value.trim(),price=Math.round(Number(document.getElementById("product-price").value)*100),active=document.getElementById("product-active").checked,file=document.getElementById("product-photo").files[0];
  if(!Number.isFinite(price)||price<0){say(status,"Enter a valid price.");return;}say(status,"Saving…");
  let image_url=items.find(p=>p.id===id)?.image_url||null;
  if(file){if(file.size>5*1024*1024){say(status,"Please choose an image under 5 MB.");return;}const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");const path=currentUser.id+"/"+crypto.randomUUID()+"."+ext;const up=await client.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});if(up.error){say(status,"Photo upload failed. Check storage setup.");return;}image_url=client.storage.from("product-images").getPublicUrl(path).data.publicUrl;}
  const row={name,description,price_cents:price,active,image_url};
  const result=id?await client.from("products").update(row).eq("id",id):await client.from("products").insert(row);
  if(result.error){say(status,"Could not save product. Check database setup.");return;}reset();say(status,"Saved.");await loadItems();
 });
 gate();
})();