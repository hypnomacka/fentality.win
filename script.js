const DISCORD_ID = '723070874336493588';
const LANYARD_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

let currentData = null;

// DOM Elements
const avatar = document.getElementById('avatar');
const username = document.getElementById('username');
const discriminator = document.getElementById('discriminator');
const statusIndicator = document.getElementById('status-indicator');
const customStatus = document.getElementById('custom-status');
const spotifyContent = document.getElementById('spotify-content');
const tabIndicator = document.querySelector('.tab-indicator');

// Tab functionality
document.querySelectorAll('.tab').forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    switchTab(tabName, index);
  });
});

function switchTab(tabName, index) {
  // Remove active class from all tabs and panels
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document
    .querySelectorAll('.tab-panel')
    .forEach((p) => p.classList.remove('active'));

  // Add active class to clicked tab and corresponding panel
  document
    .querySelector(`[data-tab="${tabName}"]`)
    .classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Move tab indicator
  moveTabIndicator(index);
}

function moveTabIndicator(index) {
  const tabs = document.querySelectorAll('.tab');
  const activeTab = tabs[index];
  const tabsContainer = document.querySelector('.tabs');
  
  if (activeTab && tabsContainer) {
    // Get positions relative to the tabs container
    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    
    // Calculate offset from container's content area
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;
    const height = tabRect.height;
    
    // Center vertically within the container
    const containerPadding = 4; // padding of tabs container
    const top = containerPadding;
    
    tabIndicator.style.left = `${left}px`;
    tabIndicator.style.width = `${width}px`;
    tabIndicator.style.height = `${height}px`;
    tabIndicator.style.top = `${top}px`;
  }
}

// Initialize tab indicator position
function initializeTabIndicator() {
  // Wait for DOM to be fully rendered
  setTimeout(() => {
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      const index = Array.from(document.querySelectorAll('.tab')).indexOf(activeTab);
      moveTabIndicator(index);
    }
  }, 50);
}

// Add this function to handle Discord badges
function updateDiscordBadges(userData) {
  const badgesContainer = document.getElementById('discord-badges');
  const badges = [];
  
  // Map Discord badge flags to badge info
  const badgeMap = {
    1: { name: 'Discord Staff', icon: 'https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png' },
    2: { name: 'Partnered Server Owner', icon: 'https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png' },
    4: { name: 'HypeSquad Events', icon: 'https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png' },
    8: { name: 'Bug Hunter Level 1', icon: 'https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png' },
    64: { name: 'House Bravery', icon: 'https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png' },
    128: { name: 'House Brilliance', icon: 'https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png' },
    256: { name: 'House Balance', icon: 'https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png' },
    512: { name: 'Early Supporter', icon: 'https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png' },
    16384: { name: 'Bug Hunter Level 2', icon: 'https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png' },
    131072: { name: 'Verified Bot Developer', icon: 'https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png' },
    4194304: { name: 'Active Developer', icon: 'https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png' },
  };
  
  // Check for Nitro
  if (userData.discord_user.premium_type) {
    const nitroIcon = userData.discord_user.premium_type === 2 
      ? 'https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png' // Nitro
      : 'https://cdn.discordapp.com/badge-icons/72bed35d44b8498ce1c4c27c18e6971d.png'; // Nitro Basic
    
    badges.push({
      name: userData.discord_user.premium_type === 2 ? 'Discord Nitro' : 'Discord Nitro Basic',
      icon: nitroIcon
    });
  }
  
  // Check public flags for badges
  if (userData.discord_user.public_flags) {
    const flags = userData.discord_user.public_flags;
    
    Object.keys(badgeMap).forEach(flag => {
      if (flags & parseInt(flag)) {
        badges.push(badgeMap[flag]);
      }
    });
  }
  
  // Clear existing badges
  badgesContainer.innerHTML = '';
  
  // Add badges to container
  badges.forEach(badge => {
    const badgeImg = document.createElement('img');
    badgeImg.src = badge.icon;
    badgeImg.alt = badge.name;
    badgeImg.title = badge.name;
    badgeImg.className = 'discord-badge';
    badgesContainer.appendChild(badgeImg);
  });
}

// Fetch Discord data from Lanyard
async function fetchDiscordData() {
  try {
    const response = await fetch(LANYARD_URL);
    const data = await response.json();

    if (data.success) {
      currentData = data.data;
      updateProfile(currentData);
      updateSpotify(currentData.spotify);
    } else {
      console.error('Failed to fetch Discord data:', data);
      showError();
    }
  } catch (error) {
    console.error('Error fetching Discord data:', error);
    showError();
  }
}

function updateProfile(data) {
  // Update avatar
  const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=256`;
  avatar.src = avatarUrl;
  avatar.alt = `${data.discord_user.username}'s avatar`;

  // Update username
  username.textContent = data.discord_user.display_name || data.discord_user.username;

  // Update discriminator (if not 0, show it)
  if (data.discord_user.discriminator !== '0') {
    discriminator.textContent = `#${data.discord_user.discriminator}`;
    discriminator.style.display = 'inline';
  } else {
    discriminator.textContent = `@${data.discord_user.username}`;
    discriminator.style.display = 'inline';
  }

  // Update status
  statusIndicator.className = `status-dot ${data.discord_status}`;

  // Update custom status
  const customStatusActivity = data.activities?.find(
    (activity) => activity.type === 4
  );
  if (customStatusActivity) {
    customStatus.textContent = customStatusActivity.state || '';
    customStatus.style.display = 'inline';
  } else {
    customStatus.style.display = 'none';
  }
  
  // Update Discord badges
  updateDiscordBadges(data);
}

function updateSpotify(spotify) {
  if (spotify) {
    spotifyContent.innerHTML = `
      <div class="spotify-track">
        <img src="${spotify.album_art_url}" alt="${spotify.album}" class="track-artwork">
        <div class="track-info">
          <h4>${spotify.song}</h4>
          <p>${spotify.artist}</p>
        </div>
      </div>
    `;
  } else {
    spotifyContent.innerHTML = '<div class="no-activity">Not listening to Spotify</div>';
  }
}

function showError() {
  username.textContent = 'Error loading profile';
  spotifyContent.innerHTML = '<div class="no-activity">Failed to load data</div>';
}

// Handle window resize to reposition tab indicator
window.addEventListener('resize', () => {
  initializeTabIndicator();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeTabIndicator();
  fetchDiscordData();
});

// Refresh data every 30 seconds
setInterval(fetchDiscordData, 30000);
