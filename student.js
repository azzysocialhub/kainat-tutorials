(() => {
 const c=window.KAINAT_CONFIG||{},s=document.getElementById("student-status"),$=id=>document.getElementById(id);
 if(!window.supabase){s.textContent="Authentication library unavailable.";return;}
 const db=window.supabase.createClient(c.supabaseUrl,c.supabasePublishableKey);
 $("logout-button").addEventListener("click",async()=>{await db.auth.signOut();location.href="login.html";});
 const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
 async function loadCatalog(){
  const {data,error}=await db.from("products").select("id,title,description,product_type,price_paise,courses(title)").eq("active",true).order("created_at",{ascending:false});
  if(error)throw error;
  $("student-catalog").innerHTML=data?.length?'<div class="record-table">'+data.map(x=>'<article class="record-row"><div><b>'+esc(x.title)+'</b><small>'+esc(x.product_type.replaceAll("_"," "))+' · ₹'+(Number(x.price_paise)/100).toFixed(2)+'</small>'+(x.courses?.title?'<small>Course: '+esc(x.courses.title)+'</small>':"")+(x.description?'<small>'+esc(x.description)+'</small>':"")+'</div><span class="order-status">Payment setup pending</span></article>').join("")+'</div>':'<p class="empty-records">No products are available yet. Please check again later.</p>';
 }
 let currentUser=null, selectedProduct=null, shopProducts=[];
 const payStatus=$("payment-form-status");
 async function loadShop(){
  const {data,error}=await db.from("products").select("id,title,description,product_type,price_paise,course_id").eq("active",true).order("created_at",{ascending:false});
  if(error)throw error;shopProducts=data||[];
  $("shop-products").innerHTML=shopProducts.length?shopProducts.map(p=>'<article class="record-row"><div><b>'+esc(p.title)+'</b><small>'+esc(p.product_type)+' · ₹'+(Number(p.price_paise)/100).toFixed(2)+'</small>'+(p.description?'<small>'+esc(p.description)+'</small>':'')+'</div><button class="auth-action" data-buy="'+esc(p.id)+'">Select</button></article>').join(""):'<p class="empty-records">No products are available yet. Please check again later.</p>';
 }
 $("shop-products").addEventListener("click",e=>{const b=e.target.closest("[data-buy]");if(!b)return;selectedProduct=shopProducts.find(p=>p.id===b.dataset.buy);if(!selectedProduct)return;$("selected-product").innerHTML='<b>'+esc(selectedProduct.title)+'</b> · ₹'+(Number(selectedProduct.price_paise)/100).toFixed(2);$("submit-payment").disabled=false;$("payment-section").scrollIntoView({behavior:"smooth"});});
 async function loadPaymentHistory(){
  const {data,error}=await db.from("payment_submissions").select("id,status,transaction_ref,created_at,admin_note,orders(amount_paise,currency)").eq("user_id",currentUser.id).order("created_at",{ascending:false});
  if(error){$("student-payment-history").innerHTML='<p class="empty-records">Payment history is unavailable until the payment database permissions are configured.</p>';return;}
  $("student-payment-history").innerHTML=data?.length?data.map(x=>'<article class="record-row"><div><b>'+esc(x.status.toUpperCase())+' · ₹'+(Number(x.orders?.amount_paise||0)/100).toFixed(2)+'</b><small>Reference: '+esc(x.transaction_ref||"Not supplied")+' · '+esc(new Date(x.created_at).toLocaleString())+'</small>'+(x.admin_note?'<small>Admin note: '+esc(x.admin_note)+'</small>':'')+'</div></article>').join(""):'<p class="empty-records">No payment submissions yet.</p>';
 }
 $("payment-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!selectedProduct||!currentUser)return;
  const f=e.currentTarget,file=f.elements.proof.files[0],ref=f.elements.transaction_ref.value.trim();
  if(!file||!ref){payStatus.textContent="Enter the transaction reference and select your screenshot.";return;}
  if(file.size>5*1024*1024){payStatus.textContent="Screenshot must be 5 MB or smaller.";return;}
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)){payStatus.textContent="Upload a PNG, JPG or WEBP image.";return;}
  const btn=$("submit-payment");btn.disabled=true;payStatus.textContent="Uploading your screenshot…";
  try{
   const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const path=currentUser.id+"/"+crypto.randomUUID()+"."+ext;
   const {error:uploadError}=await db.storage.from("payment-proofs").upload(path,file,{contentType:file.type,upsert:false});
   if(uploadError)throw uploadError;
   payStatus.textContent="Submitting payment for admin review…";
   const {data,error}=await db.rpc("submit_upi_payment",{p_product_id:selectedProduct.id,p_screenshot_path:path,p_transaction_ref:ref});
   if(error){await db.storage.from("payment-proofs").remove([path]);throw error;}
   payStatus.textContent="Payment submission received. Your order ID is "+data+". Access will be granted only after admin verification.";
   f.reset();selectedProduct=null;$("selected-product").textContent="Select a product above to begin.";$("submit-payment").disabled=true;
   await loadPaymentHistory();
   const msg="New UPI payment submitted on Kainat Tutorials. Order: "+data;
   window.open("https://wa.me/"+(c.whatsappNumber||"919390734560")+"?text="+encodeURIComponent(msg),"_blank","noopener");
  }catch(err){payStatus.textContent="Could not submit payment: "+err.message;btn.disabled=!selectedProduct;}
 });
 const upiPayload="upi://pay?pa="+encodeURIComponent(c.upiId||"")+"&pn="+encodeURIComponent(c.upiPayeeName||"Kainat Tutorials")+"&cu=INR";
 $("upi-id-display").textContent="UPI ID: "+(c.upiId||"Not configured");
 $("upi-pay-link").href=upiPayload;
 $("upi-qr-image").src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data="+encodeURIComponent(upiPayload);
 $("refresh-shop").addEventListener("click",()=>loadShop().catch(e=>payStatus.textContent=e.message));
 $("refresh-payment-history").addEventListener("click",()=>loadPaymentHistory());
 async function loadAccess(user){
  const [a,l]=await Promise.all([
   db.from("product_access").select("product_id,granted_at,products(id,title,description,product_type,course_id)").eq("user_id",user.id).order("granted_at",{ascending:false}),
   db.from("lessons").select("id,title,description,video_url,position,is_preview,courses(title)").order("course_id").order("position")
  ]);
  if(a.error) throw a.error;
  $("student-products").innerHTML=a.data?.length?a.data.map(x=>'<article class="record-row"><div><b>'+esc(x.products?.title||"Purchased product")+'</b><small>'+esc(x.products?.product_type||"Learning resource")+' · Access granted '+new Date(x.granted_at).toLocaleDateString()+'</small>'+(x.products?.description?'<small>'+esc(x.products.description)+'</small>':"")+'</div><span class="order-status">Access active</span></article>').join(""):'<p class="empty-records">No purchases have been approved yet. Once your payment is verified, your products will appear here.</p>';
  if(l.error){$("student-lessons").innerHTML='<p class="empty-records">Lesson access is not enabled yet. Your course lessons will appear here after the database access rules are configured.</p>';return;}
  $("student-lessons").innerHTML=l.data?.length?l.data.map(x=>'<article class="record-row"><div><b>'+esc(x.title)+'</b><small>'+esc(x.courses?.title||"Course")+' · '+(x.is_preview?"Free preview":"Course lesson")+'</small>'+(x.description?'<small>'+esc(x.description)+'</small>':"")+'</div>'+(x.video_url?'<a class="text-link" href="'+esc(x.video_url)+'" target="_blank" rel="noopener">Open lesson ↗</a>':'<span class="order-status">Video link not added</span>')+'</article>').join(""):'<p class="empty-records">No lessons added yet.</p>';
 }
 let currentUser=null;
 async function refreshAll(){if(!currentUser)return;try{await Promise.all([loadCatalog(),loadAccess(currentUser)]);s.textContent="Dashboard refreshed.";}catch(e){s.textContent="Some student information could not load: "+e.message;}}
 (async()=>{const {data:{user}}=await db.auth.getUser();if(!user){location.href="login.html";return;}currentUser=user;const {data:p,error}=await db.from("profiles").select("full_name,role").eq("id",user.id).single();if(error){s.textContent="Could not load your student profile: "+error.message;return;}if(p.role==="admin"){location.href="admin.html";return;}currentUser=user;$("student-welcome").textContent="Welcome, "+(p.full_name||user.email)+". Browse products and view your approved learning resources below.";await refreshAll();})();
 $("refresh-catalog").addEventListener("click",()=>loadCatalog().catch(e=>s.textContent="Could not load products: "+e.message));
 $("refresh-access").addEventListener("click",()=>loadAccess(currentUser).catch(e=>s.textContent="Refresh failed: "+e.message));
})();