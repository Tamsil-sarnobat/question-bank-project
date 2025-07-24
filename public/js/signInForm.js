document.addEventListener("DOMContentLoaded", () => {
const studentRadio = document.querySelector("#studentRadio");
const teacherRadio = document.querySelector("#teacherRadio");
const semesterSelect = document.querySelector("select[name='semester']");

function toggleSemester() {
  if (studentRadio.checked) {
    semesterSelect.parentElement.style.display = "block";
    semesterSelect.required = true;
  } else {
    semesterSelect.parentElement.style.display = "none";
    semesterSelect.required = false;
    semesterSelect.value = "";
  }
}

studentRadio.addEventListener("change", toggleSemester);
teacherRadio.addEventListener("change", toggleSemester);

toggleSemester();

});