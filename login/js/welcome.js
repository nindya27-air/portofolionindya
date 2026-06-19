document.addEventListener("DOMContentLoaded", function () {

    function goLogin() {
        window.location.href = "login/index.html";
    }

    function logout() {
        localStorage.removeItem("username");
        location.reload();
    }

    const user = localStorage.getItem("username");

    if (user) {
        document.getElementById("userInfo").innerText = "Halo, " + user;

        document.getElementById("authArea").innerHTML = `
            <button onclick="logout()" class="nav-cta">Logout</button>
        `;
    }

    window.goLogin = goLogin;
    window.logout = logout;

});
