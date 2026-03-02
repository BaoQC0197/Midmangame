// js/main.js

let isAdmin = false;

// =============================
// CHECK LOGIN
// =============================
async function checkUser() {
  const { data } = await window.supabaseClient.auth.getUser();
  const user = data?.user;

  if (user && user.email === "bao@gmail.com") {
    isAdmin = true;
    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";
  }

  loadProducts();
}

// =============================
// LOAD PRODUCTS
// =============================
async function loadProducts() {
    console.log("isAdmin =", isAdmin);
  const products = await getProducts();
  renderProducts(products, isAdmin);
}

// =============================
// ADD PRODUCT
// =============================


// =============================
// DELETE PRODUCT
// =============================
async function removeProduct(id) {
  await deleteProduct(id);
  loadProducts();
}

// =============================
// EDIT PRODUCT
// =============================
async function editProduct(id) {

  if (!isAdmin) {
    alert("Bạn không có quyền sửa sản phẩm");
    return;
  }

  const { data, error } = await window.supabaseClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("Không lấy được dữ liệu");
    return;
  }

  currentEditId = id;

  document.getElementById("edit-name").value = data.name || "";
  document.getElementById("edit-price").value = data.price || "";
  document.getElementById("edit-image").value = data.image || "";
  document.getElementById("edit-desc").value = data.description || "";

  document.getElementById("edit-modal").classList.remove("hidden");
}



// =============================
// LOGIN
// =============================
async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } =
    await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert("Sai email hoặc mật khẩu");
    return;
  }

  if (data.user.email === "bao@gmail.com") {
    isAdmin = true;

    document.getElementById("admin-panel").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";

    document.getElementById("email").classList.add("hidden");
    document.getElementById("password").classList.add("hidden");
    document.getElementById("login-btn").classList.add("hidden");

    document.getElementById("welcome-text").innerText = "Chào admin 👋";
    document.getElementById("welcome-text").classList.remove("hidden");

    document.getElementById("logout-btn").classList.remove("hidden");
  }

  // 👇 Force render lại sau khi state chắc chắn đã đổi
  await loadProducts();
}


// =============================
// LOGOUT
// =============================
async function handleLogout() {
  await window.supabaseClient.auth.signOut();
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("email").classList.remove("hidden");
document.getElementById("password").classList.remove("hidden");
document.getElementById("login-btn").classList.remove("hidden");

document.getElementById("welcome-text").classList.add("hidden");

document.getElementById("logout-btn").classList.add("hidden");

  location.reload();
}
async function handleUpdate() {

  if (!isAdmin) {
    alert("Không có quyền cập nhật");
    return;
  }

  const name = document.getElementById("edit-name").value;
  const price = parseInt(document.getElementById("edit-price").value);
  const image = document.getElementById("edit-image").value;
  const description = document.getElementById("edit-desc").value;

  const { error } = await window.supabaseClient
    .from("products")
    .update({
      name,
      price,
      image,
      description
    })
    .eq("id", currentEditId);

  if (error) {
    alert("Lỗi cập nhật: " + error.message);
    return;
  }

  closeEdit();
  loadProducts();
}
function closeEdit() {
  document.getElementById("edit-modal").classList.add("hidden");
}

// RUN
checkUser();

window.handleUpdate = handleUpdate;
window.closeEdit = closeEdit;
window.editProduct = editProduct;