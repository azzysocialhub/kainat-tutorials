(() => {
 const cfg=window.KAINAT_CONFIG||{};
 const status=document.getElementById("auth-status");
 if(!window.supabase||!cfg.supabaseUrl||!cfg.supabasePublishableKey){if(status)status.textContent="Login configuration is incomplete. Please contact the website administrator.";return;}
 const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
 const form=document.getElementById("auth-form");
 const submit=document.getElementById("auth-submit");
 const googleButton=document.getElementById("google-login");
 googleButton.addEventListener("click",async()=>{
  googleButton.disabled=true;status.classList.remove("auth-error");status.textContent="Connecting to Google…";
  try{const {error}=await client.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+"/student.html"}});if(error)throw error;}
  catch(err){status.classList.add("auth-error");status.textContent=err.message||"Google sign-in could not be started.";googleButton.disabled=false;}
 });
 form.addEventListener("submit",async e=>{
  e.preventDefault();status.classList.remove("auth-error");submit.disabled=true;status.textContent="Please wait…";
  try{
   const email=form.email.value.trim(),password=form.password.value;
   const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
   const {data:{user}}=await client.auth.getUser();
   const {data:profile,error:profileError}=await client.from("profiles").select("role").eq("id",user.id).single();
   if(profileError)throw profileError;
   location.href=profile.role==="admin"?"admin.html":"student.html";
  }catch(err){status.classList.add("auth-error");status.textContent=err.message||"Unable to sign in."; }
  finally{submit.disabled=false;}
 });
 client.auth.getSession().then(({data})=>{if(data.session)location.href="student.html";});
})();