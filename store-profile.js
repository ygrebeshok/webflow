var authLogout = document.querySelectorAll('[store-logout]');

authLogout.forEach(function(el) {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    firebase.auth().signOut().then(function() {
      user = null;
      window.location.href = webflowAuth.logoutRedirectPath;
    });
  });
});
