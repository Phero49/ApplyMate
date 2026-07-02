export interface NotificationData {
  message: string;
  type: "positive" | "negative" | "info";
  url?: string;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}
function getNotificationColors(type: "positive" | "negative" | "info") {
  if (type === "positive") {
    return {
      bgColor: "#4caf50",
      borderColor: "#388e3c",
      icon: "✓",
      iconColor: "#ffffff",
    };
  } else if (type === "negative") {
    return {
      bgColor: "#f44336",
      borderColor: "#d32f2f",
      icon: "✗",
      iconColor: "#ffffff",
    };
  } else {
    return {
      bgColor: "#2196f3",
      borderColor: "#1976d2",
      icon: "ℹ",
      iconColor: "#ffffff",
    };
  }
}

export function createNotification({
  message,
  url,
  type,
  position,
}: NotificationData) {
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.zIndex = "10000";
  div.id = "applymate-notification";
  const colors = getNotificationColors(type);
  div.style.backgroundColor = colors.bgColor;
  div.style.padding = "20px";
  div.style.borderRadius = "10px";
  div.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.gap = "10px";
  div.style.maxWidth = "500px";
  div.style.minWidth = "250px";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.fontSize = "14px";
  div.style.color = "#ffffff";
  div.style.transition = "all 0.3s ease";
  div.style.opacity = "0";
  div.style.borderLeft = `4px solid ${colors.borderColor}`;

  // Set position based on parameter (default to 'top-right')
  const pos = position || "top-right";

  switch (pos) {
    case "top-right":
      div.style.top = "20px";
      div.style.right = "20px";
      div.style.transform = "translateX(20px)";
      break;
    case "top-left":
      div.style.top = "20px";
      div.style.left = "20px";
      div.style.transform = "translateX(-20px)";
      break;
    case "bottom-right":
      div.style.bottom = "20px";
      div.style.right = "20px";
      div.style.transform = "translateX(20px)";
      break;
    case "bottom-left":
      div.style.bottom = "20px";
      div.style.left = "20px";
      div.style.transform = "translateX(-20px)";
      break;
    case "top-center":
      div.style.top = "20px";
      div.style.left = "50%";
      div.style.transform = "translateX(-50%) translateY(-20px)";
      break;
    case "bottom-center":
      div.style.bottom = "20px";
      div.style.left = "50%";
      div.style.transform = "translateX(-50%) translateY(20px)";
      break;
  }

  if (url) {
    div.style.cursor = "pointer";
    div.style.pointerEvents = "auto";
  } else {
    div.style.pointerEvents = "none";
  }

  // Create icon element
  const iconElement = document.createElement("div");
  iconElement.textContent = colors.icon;
  iconElement.style.width = "40px";
  iconElement.style.height = "40px";
  iconElement.style.flexShrink = "0";
  iconElement.style.display = "flex";
  iconElement.style.alignItems = "center";
  iconElement.style.justifyContent = "center";
  iconElement.style.fontSize = "24px";
  iconElement.style.fontWeight = "bold";
  iconElement.style.color = colors.iconColor;
  iconElement.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  iconElement.style.borderRadius = "50%";
  iconElement.style.border = `2px solid ${colors.iconColor}`;

  const textContainer = document.createElement("div");
  textContainer.style.flex = "1";
  textContainer.style.minWidth = "0";

  const text = document.createElement("span");
  text.textContent = message;
  text.style.display = "block";
  text.style.lineHeight = "1.4";
  text.style.wordWrap = "break-word";
  text.style.overflowWrap = "break-word";
  text.style.fontWeight = "500";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
  closeBtn.style.border = "none";
  closeBtn.style.fontSize = "20px";
  closeBtn.style.fontWeight = "bold";
  closeBtn.style.color = "#ffffff";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.padding = "0 5px";
  closeBtn.style.lineHeight = "1";
  closeBtn.style.flexShrink = "0";
  closeBtn.style.marginLeft = "10px";
  closeBtn.style.borderRadius = "50%";
  closeBtn.style.width = "24px";
  closeBtn.style.height = "24px";
  closeBtn.style.display = "flex";
  closeBtn.style.alignItems = "center";
  closeBtn.style.justifyContent = "center";
  closeBtn.style.pointerEvents = "auto";

  closeBtn.onclick = (e) => {
    e.stopPropagation();
    removeNotification(div);
  };

  if (url) {
    div.onclick = (e) => {
      if (e.target !== closeBtn && !closeBtn.contains(e.target as Node)) {
        window.open(url, "_blank");
        removeNotification(div);
      }
    };
  }

  textContainer.appendChild(text);
  div.appendChild(iconElement);
  div.appendChild(textContainer);
  div.appendChild(closeBtn);

  document.body.appendChild(div);

  // Trigger fade-in effect with position-specific animation
  setTimeout(() => {
    div.style.opacity = "1";
    if (pos === "top-right" || pos === "top-left") {
      div.style.transform = "translateX(0)";
    } else if (pos === "bottom-right" || pos === "bottom-left") {
      div.style.transform = "translateX(0)";
    } else if (pos === "top-center") {
      div.style.transform = "translateX(-50%) translateY(0)";
    } else if (pos === "bottom-center") {
      div.style.transform = "translateX(-50%) translateY(0)";
    }
  }, 10);

  setTimeout(() => {
    if (document.body.contains(div)) {
      removeNotification(div);
    }
  }, 10000);
}

function removeNotification(element: HTMLElement) {
  element.style.opacity = "0";
  const currentTransform = element.style.transform;
  if (currentTransform.includes("translateX(-50%)")) {
    element.style.transform = "translateX(-50%) translateY(-20px)";
  } else if (currentTransform.includes("translateY(20px)")) {
    element.style.transform = "translateX(-50%) translateY(20px)";
  } else {
    element.style.transform = element.style.transform.replace(
      "translateX(0)",
      "translateX(20px)",
    );
  }
  setTimeout(() => {
    if (element.parentNode) {
      element.remove();
    }
  }, 300);
}
