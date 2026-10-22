const STORAGE_KEY = 'ikiminapay.activeGroupId';
const $ = (selector) => document.querySelector(selector);
const welcome = $('#welcome');
const dashboard = $('#dashboard');
const notice = $('#notice');
let groupId = localStorage.getItem(STORAGE_KEY);
let currentSummary = null;
let noticeTimer;

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
  return payload;
}

function showNotice(message, kind = '') {
  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.className = `notice ${kind}`;
  notice.hidden = false;
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 4500);
}

function formatMoney(amount) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)} RWF`;
}

function showWorkspace(hasGroup) {
  welcome.hidden = hasGroup;
  dashboard.hidden = !hasGroup;
}

async function refreshSummary() {
  if (!groupId) return;
  try {
    currentSummary = await request(`/groups/${encodeURIComponent(groupId)}/summary`);
    renderSummary(currentSummary);
    showWorkspace(true);
  } catch (error) {
    if (error.message === 'Group not found') {
      localStorage.removeItem(STORAGE_KEY);
      groupId = null;
      currentSummary = null;
      showWorkspace(false);
      showNotice('Your saved group could not be found. Create a new group to continue.', 'error');
      return;
    }
    showNotice(error.message, 'error');
  }
}

function renderSummary(summary) {
  $('#group-title').textContent = summary.groupName;
  $('#group-balance').textContent = formatMoney(summary.balance);
  $('#summary-total').textContent = formatMoney(summary.balance);
  $('#member-count').textContent = summary.members.length;

  const membersList = $('#members-list');
  const memberSelect = $('#payment-member');
  membersList.replaceChildren();
  memberSelect.replaceChildren(new Option('Choose a member', ''));
  if (summary.members.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Add your first member to start tracking.';
    membersList.append(empty);
  }
  summary.members.forEach((member) => {
    const row = document.createElement('div');
    row.className = 'member-row';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.textContent = member.name.trim().charAt(0).toUpperCase();
    const name = document.createElement('span');
    name.className = 'member-name';
    name.textContent = member.name;
    const total = document.createElement('span');
    total.className = 'member-total';
    total.textContent = formatMoney(member.total);
    row.append(avatar, name, total);
    membersList.append(row);
    memberSelect.add(new Option(member.name, member.memberId));
  });

  const summaryList = $('#summary-list');
  summaryList.replaceChildren();
  if (summary.members.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Member totals will appear here.';
    summaryList.append(empty);
  }
  summary.members.forEach((member) => {
    const row = document.createElement('div');
    row.className = 'summary-row';
    const name = document.createElement('span');
    name.textContent = member.name;
    const amount = document.createElement('strong');
    amount.textContent = formatMoney(member.total);
    row.append(name, amount);
    summaryList.append(row);
  });
}

async function submitForm(form, path, successMessage, onSuccess) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await request(path, {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
    });
    form.reset();
    if (onSuccess) await onSuccess(result);
    showNotice(successMessage);
  } catch (error) {
    showNotice(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

$('#create-group-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#group-name').value.trim();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  request('/groups', { method: 'POST', body: JSON.stringify({ name }) })
    .then((group) => {
      groupId = group.id;
      localStorage.setItem(STORAGE_KEY, groupId);
      return refreshSummary();
    })
    .then(() => showNotice('Your savings group is ready.'))
    .catch((error) => showNotice(error.message, 'error'))
    .finally(() => { button.disabled = false; });
});

$('#member-form').addEventListener('submit', (event) => {
  event.preventDefault();
  submitForm(event.currentTarget, `/groups/${encodeURIComponent(groupId)}/members`, 'Member added to your group.', refreshSummary);
});

$('#payment-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const memberId = $('#payment-member').value;
  const amount = Number($('#payment-amount').value);
  const date = $('#payment-date').value;
  if (!memberId) return showNotice('Choose a member for this payment.', 'error');
  if (!Number.isFinite(amount) || amount <= 0) return showNotice('Enter an amount greater than zero.', 'error');

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Processing simulation…';
  window.setTimeout(async () => {
    const succeeded = Math.random() < 0.8;
    if (!succeeded) {
      showNotice('Mobile money payment failed. No contribution was recorded.', 'failure');
      button.disabled = false;
      button.innerHTML = 'Simulate mobile money payment <span>→</span>';
      return;
    }
    try {
      await request(`/groups/${encodeURIComponent(groupId)}/contributions`, {
        method: 'POST',
        body: JSON.stringify({ memberId, amount: Number(amount), date })
      });
      form.reset();
      $('#payment-date').value = new Date().toISOString().slice(0, 10);
      await refreshSummary();
      showNotice('Payment successful. The contribution has been recorded.');
    } catch (error) {
      showNotice(error.message, 'error');
    } finally {
      button.disabled = false;
      button.innerHTML = 'Simulate mobile money payment <span>→</span>';
    }
  }, 700);
});

$('#new-group').addEventListener('click', () => {
  groupId = null;
  currentSummary = null;
  localStorage.removeItem(STORAGE_KEY);
  $('#create-group-form').reset();
  showWorkspace(false);
});

$('#payment-date').value = new Date().toISOString().slice(0, 10);
if (groupId) {
  showWorkspace(true);
  refreshSummary();
} else {
  showWorkspace(false);
}
