(() => {
 const c=window.KAINAT_CONFIG||{},s=document.getElementById("student-status"),$=id=>document.getElementById(id);
 if(!window.supabase){s.textContent="Authentication library unavailable.";return;}
 const db=window.supabase.createClient(c.supabaseUrl,c.supabasePublishableKey);
 $("logout-button").addEventListener("click",async()=>{await db.auth.signOut();location.href="login.html";});
 const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
 async function loadAccess(user){
  const [a,l]=await Promise.all([
   db.from("product_access").select("product_id,granted_at,products(id,title,description,product_type,course_id)").eq("user_id",user.id).order("granted_at",{ascending:false}),
   db.from("lessons").select("id,title,description,video_url,position,is_preview,courses(title)").order("course_id").order("position")
  ]);
  if(a.error) throw a.error;
  $("student-products").innerHTML=a.data?.length?a.data.map(x=>'<article class="record-row"><div><b>'+esc(x.products?.title||"Purchased product")+'</b><small>'+esc(x.products?.product_type||"Learning resource")+' · Access granted '+new Date(x.granted_at).toLocaleDateString()+'</small>'+(x.products?.description?'<small>'+esc(x.products.description)+'</small>':"")+'</div><span class="order-status">Access active</span></article>').join(""):'<p class="empty-records">No purchases have been approved yet. Once your payment is verified, your products will appear here.</p>';
  if(l.error){$("student-lessons").innerHTML='<p class="empty-records">Lesson access is not enabled yet. Your course lessons will appear here after the database access rules are configured.</p>';return;}
  $("student-lessons").innerHTML=l.data?.length?l.data.map(x=>'<article class="record-row"><div><b>'+esc(x.title)+'</b><small>'+esc(x.courses?.title||"Course")+' · '+(x.is_preview?"Free preview":"Course lesson")+'</small>'+(x.description?'<small>'+esc(x.description)+'</small>':"")+'</div>'+(x.video_url?'<a class="text-link" href="'+esc(x.video_url)+'" target="_blank" rel="noopener">Open lesson ↗</a>':'<span class="order-status">Video link not added</span>')+'</article>').join(""):'<p class="empty-records">No lessons are published yet.</p>';
 }
 (async()=>{const {data:{user}}=await db.auth.getUser();if(!user){location.href="login.html";return;}const {data:p,error}=await db.from("profiles").select("full_name,role").eq("id",user.id).single();if(error){s.textContent="Could not load your student profile: "+error.message;return;}if(p.role==="admin"){location.href="admin.html";return;}$("student-welcome").textContent="Welcome, "+(p.full_name||user.email)+". Your approved learning resources are shown below.";try{await loadAccess(user);}catch(e){s.textContent="Your purchases could not be loaded: "+e.message;}})();
 $("refresh-access").addEventListener("click",async()=>{const {data:{user}}=await db.auth.getUser();if(user){try{await loadAccess(user);s.textContent="Your learning access has been refreshed.";}catch(e){s.textContent="Refresh failed: "+e.message;}}});
})();