document.querySelectorAll(".nav--list a").forEach(link=>{
  link.addEventListener("click",event=>{
    event.preventDefault();
    document.querySelectorAll(".item").forEach(item=>item.classList.remove("active"));
    link.closest(".item").classList.add("active");
  });
});