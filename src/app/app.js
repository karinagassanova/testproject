document.addEventListener('DOMContentLoaded', function() {
  const diagram = document.getElementById('diagram');
  const showProxyButton = document.getElementById('showProxy');
  const hideProxyButton = document.getElementById('hideProxy');

  showProxyButton.addEventListener('click', function() {
    diagram.style.display = 'block'; // Show the diagram
  });

  hideProxyButton.addEventListener('click', function() {
    diagram.style.display = 'none'; // Hide the diagram
  });
});
