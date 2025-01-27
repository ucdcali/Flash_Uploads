// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Select all edit buttons
  const editButtons = document.querySelectorAll("button[id^='edit_btn_']");
  const delButtons = document.querySelectorAll("button[id^='delete_btn_']");

  // Iterate through each edit button
  editButtons.forEach((button) => {
    // Derive the corresponding form ID
    const formId = button.id.replace("btn", "form");
    const form = document.getElementById(formId);

    // Add click event listener to the current button
    button.addEventListener("click", () => {
      // Hide the button
      button.style.display = "none";

      // Show the corresponding form
      form.style.display = "inline";
    });
  });

  // Iterate through each delete button
  delButtons.forEach((button) => {
    // Derive the corresponding form ID
    const confirmId = button.id.replace("delete", "confirm");
    const confirmBtn = document.getElementById(confirmId);

    // Add click event listener to the current button
    button.addEventListener("click", () => {
      // Hide the button
      button.style.display = "none";

      // Show the corresponding form
      confirmBtn.style.display = "inline";
    });
  });
});
