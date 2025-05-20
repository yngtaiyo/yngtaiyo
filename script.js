// script.js

// Beats data - update URLs and titles as needed
const beats = [
  {
    title: "Groovy",
    bpm: 90,
    url: "https://yngtaiyo.s3.eu-north-1.amazonaws.com/groovy.wav",
  },
  {
    title: "Hitoyobashi",
    bpm: 75,
    url: "https://yngtaiyo.s3.eu-north-1.amazonaws.com/hitoyobashi.wav",
  },
  {
    title: "Trap Beat",
    bpm: 140,
    url: "https://yngtaiyo.s3.eu-north-1.amazonaws.com/trapbeat.wav",
  },
];

// Lease options with prices
const LEASE_OPTIONS = {
  Standard: 25,
  Premium: 55,
  Exclusive: 199,
};

// License PDF URLs for each lease type
const LICENSE_PDFS = {
  Standard:
    "https://yngtaiyo.s3.eu-north-1.amazonaws.com/YNG%20TAIYO%20Standard%20Beat%20Lease%20License%20Agreement.pdf",
  Premium:
    "https://yngtaiyo.s3.eu-north-1.amazonaws.com/YNG%20TAIYO%20Premium%20Beat%20Lease%20License%20Agreement.pdf",
  Exclusive:
    "https://yngtaiyo.s3.eu-north-1.amazonaws.com/YNG%20TAIYO%20Exclusive%20Beat%20Lease%20License%20Agreement.pdf",
};

// DOM references
const beatsTableBody = document.querySelector("#beatsTable tbody");
const playPauseBtn = document.getElementById("playPauseBtn");
const volumeSlider = document.getElementById("volumeSlider");
const cartList = document.getElementById("cartList");
const cartTotalEl = document.getElementById("cartTotal");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const paypalContainer = document.getElementById("paypal-button-container");

// Audio player setup
const audio = new Audio();
audio.volume = volumeSlider.value;

let currentBeatUrl = null;
let isPlaying = false;

// Cart array
const cart = [];

// Populate beats table with lease dropdown and buttons
function populateBeatsTable() {
  beatsTableBody.innerHTML = "";

  beats.forEach((beat, index) => {
    const tr = document.createElement("tr");

    // Title
    const titleTd = document.createElement("td");
    titleTd.textContent = beat.title;
    tr.appendChild(titleTd);

    // BPM
    const bpmTd = document.createElement("td");
    bpmTd.textContent = beat.bpm;
    tr.appendChild(bpmTd);

    // Lease dropdown
    const leaseTd = document.createElement("td");
    const leaseSelect = document.createElement("select");
    leaseSelect.classList.add("lease-select");
    leaseSelect.setAttribute("data-index", index);
    leaseSelect.setAttribute("aria-label", `Select lease for ${beat.title}`);

    // Add lease options
    for (const lease in LEASE_OPTIONS) {
      const option = document.createElement("option");
      option.value = lease;
      option.textContent = `${lease} ($${LEASE_OPTIONS[lease]})`;
      leaseSelect.appendChild(option);
    }
    leaseTd.appendChild(leaseSelect);
    tr.appendChild(leaseTd);

    // Play button
    const playTd = document.createElement("td");
    const playBtn = document.createElement("button");
    playBtn.textContent = "▶️";
    playBtn.setAttribute("aria-label", `Play ${beat.title} beat`);
    playBtn.addEventListener("click", () => {
      playBeat(beat.url, beat.title);
    });
    playTd.appendChild(playBtn);
    tr.appendChild(playTd);

    // Add to cart button
    const cartTd = document.createElement("td");
    const cartBtn = document.createElement("button");
    cartBtn.textContent = "Add";
    cartBtn.setAttribute("aria-label", `Add ${beat.title} to cart`);
    cartBtn.addEventListener("click", () => addToCart(index));
    cartTd.appendChild(cartBtn);
    tr.appendChild(cartTd);

    beatsTableBody.appendChild(tr);
  });
}

// Play/pause a beat
function playBeat(url, title) {
  if (currentBeatUrl === url) {
    if (isPlaying) {
      audio.pause();
      updatePlayButton(false);
    } else {
      audio.play();
      updatePlayButton(true);
    }
  } else {
    audio.src = url;
    audio.play();
    currentBeatUrl = url;
    updatePlayButton(true);
  }
}

function updatePlayButton(playing) {
  if (playing) {
    playPauseBtn.textContent = "Pause";
    playPauseBtn.setAttribute("aria-pressed", "true");
    isPlaying = true;
  } else {
    playPauseBtn.textContent = "Play";
    playPauseBtn.setAttribute("aria-pressed", "false");
    isPlaying = false;
  }
}

// Play/pause button in controls
playPauseBtn.addEventListener("click", () => {
  if (!audio.src) {
    alert("Please select a beat to play first.");
    return;
  }
  if (isPlaying) {
    audio.pause();
    updatePlayButton(false);
  } else {
    audio.play();
    updatePlayButton(true);
  }
});

// Volume control
volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});

// When audio ends
audio.addEventListener("ended", () => {
  updatePlayButton(false);
});

// Add beat to cart with selected lease & price
function addToCart(index) {
  const beat = beats[index];
  if (!beat) return;

  const leaseSelect = document.querySelector(`select.lease-select[data-index="${index}"]`);
  const selectedLease = leaseSelect ? leaseSelect.value : "Standard";
  const price = LEASE_OPTIONS[selectedLease];
  const licensePdfUrl = LICENSE_PDFS[selectedLease];

  // Avoid duplicates with same title & lease
  const duplicate = cart.find(
    (item) => item.title === beat.title && item.lease === selectedLease
  );
  if (duplicate) {
    alert(`${beat.title} with ${selectedLease} license is already in your cart.`);
    return;
  }

  cart.push({
    title: beat.title,
    bpm: beat.bpm,
    lease: selectedLease,
    price,
    url: beat.url,
    licensePdf: licensePdfUrl, // <-- license PDF URL added here
  });

  updateCartUI();
}

// Update cart display
function updateCartUI() {
  cartList.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    emptyCartMessage.style.display = "block";
    cartTotalEl.textContent = "";
  } else {
    emptyCartMessage.style.display = "none";

    cart.forEach((item, idx) => {
      const li = document.createElement("li");
      li.textContent = `${item.title} - ${item.lease} License - $${item.price}`;

      // Optional: Add remove button per cart item
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.style.marginLeft = "10px";
      removeBtn.addEventListener("click", () => {
        cart.splice(idx, 1);
        updateCartUI();
      });
      li.appendChild(removeBtn);

      cartList.appendChild(li);
      total += item.price;
    });

    cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
  }

  renderPayPalButton(total);
}

// PayPal button render/reset function
function renderPayPalButton(total) {
  paypalContainer.innerHTML = ""; // Clear previous button if any

  if (total <= 0) return; // Don't render if no items

  // Load PayPal Buttons (assuming PayPal SDK is loaded in HTML with your client-id)
  if (typeof paypal === "undefined") {
    // PayPal SDK not loaded
    const errorMsg = document.createElement("p");
    errorMsg.textContent = "PayPal SDK failed to load.";
    paypalContainer.appendChild(errorMsg);
    return;
  }

  paypal.Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: total.toFixed(2),
            },
            description: "Beat purchases from YNG TAIYO",
          },
        ],
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(function (details) {
        alert(
          `Transaction completed by ${details.payer.name.given_name}! Thank you for your purchase.`
        );

        // Save cart to localStorage for the download page
        localStorage.setItem("purchasedItems", JSON.stringify(cart));

        // Clear cart and update UI
        cart.length = 0;
        updateCartUI();

        // Redirect to download page
        window.location.href = "download.html";
      });
    },
    onError: (err) => {
      console.error("PayPal Checkout error:", err);
      alert("An error occurred during the PayPal transaction.");
    },
  }).render("#paypal-button-container");
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  populateBeatsTable();
  updateCartUI();
});
