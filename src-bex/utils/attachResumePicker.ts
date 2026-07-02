export function attachResumePickerDropDown(
  element: HTMLInputElement,
  availableResumes: { name: string; time: string }[],
  onclick: (resume: { name: string; time: string }) => void,
) {
  const dropDown = document.createElement("div");
  dropDown.className = "resume-picker-dropdown";
  dropDown.style.position = "absolute";
  dropDown.style.top = "100%";
  dropDown.style.left = "0";
  dropDown.style.zIndex = "1000";
  dropDown.style.backgroundColor = "white";
  dropDown.style.border = "1px solid #ccc";
  dropDown.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
  dropDown.style.borderRadius = "4px";
  dropDown.style.padding = "8px 0";
  dropDown.style.minWidth = "200px";
  dropDown.style.maxHeight = "300px";
  dropDown.style.overflowY = "auto";
  const dropDownTitle = document.createElement("div");
  dropDownTitle.textContent = "Select a resume";
  dropDownTitle.style.padding = "8px 12px";
  dropDownTitle.style.fontWeight = "bold";
  dropDownTitle.style.borderBottom = "1px solid #ccc";
  dropDown.appendChild(dropDownTitle);
  const emptyState = document.createElement("div");
  emptyState.textContent = "No resumes found";
  emptyState.style.padding = "8px 12px";
  if (availableResumes.length === 0) {
    dropDown.appendChild(emptyState);
  } else {
    availableResumes.forEach((resume) => {
      const item = document.createElement("div");
      item.className = "resume-picker-item";
      item.style.padding = "8px 12px";
      item.style.cursor = "pointer";
      item.style.transition = "background-color 0.2s";
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";

      item.innerHTML = `
      <span class="resume-name">${resume.name}</span>
      <span class="resume-time">${resume.time}</span>
    `;

      item.addEventListener("mouseenter", () => {
        item.style.backgroundColor = "#f5f5f5";
      });

      item.addEventListener("mouseleave", () => {
        item.style.backgroundColor = "transparent";
      });

      item.addEventListener("click", () => {
        onclick(resume);

        // Handle resume selection
        console.log("Selected resume:", resume);
        // You can add your logic here to attach the selected resume
        // For example: element.value = resume.name;
        // element.dispatchEvent(new Event('change', { bubbles: true }));

        // Close the dropdown
        dropDown.remove();
      });

      dropDown.appendChild(item);
    });
  }

  element.parentElement?.appendChild(dropDown);
}
