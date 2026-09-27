(() => {
  const input = document.querySelector('#setup-repo');
  input.addEventListener('input', () => {
    const repo = input.value.trim();
    const valid = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo) && !repo.split('/').some(p => p === '.' || p === '..');
    document.querySelector('#setup-links').hidden = !valid;
    for (const [id, suffix] of [['secrets-link', 'secrets'], ['variables-link', 'variables']]) {
      const link = document.getElementById(id);
      if (valid) link.href = `https://github.com/${repo}/settings/${suffix}/actions`;
      else link.removeAttribute('href');
    }
  });
  document.querySelectorAll('[data-provider]').forEach(button => button.addEventListener('click', () => {
    const bob = button.dataset.provider === 'bob';
    document.querySelectorAll('[data-provider]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const values = {
      'setup-secret': bob ? 'COMPASS_BOB_API_KEY' : 'COMPASS_OPENAI_API_KEY',
      'provider-value': bob ? 'bob' : 'openai',
      'provider-note': bob ? 'Use a Bob Inference-scope API key. Bob Shell 2.0.5 is required; the workflow installs and verifies it.' : 'Use an OpenAI API key with access to your chosen Responses-compatible model. ChatGPT subscriptions do not include API credits.',
      'provider-variable': bob ? 'COMPASS_ACCEPT_BOB_LICENSE' : 'COMPASS_MODEL',
      'provider-variable-value': bob ? 'true — after accepting IBM’s license' : 'Your compatible model ID; default: gpt-4.1-mini',
      'setup-budget': bob ? 'Requested limit: 0.5 Bobcoins and four turns. Repair is disabled. Verify actual usage with IBM.' : 'Limit: 2,048 output tokens, not a dollar cap. No automatic retry or repair. Verify actual usage with OpenAI.'
    };
    Object.entries(values).forEach(([id, text]) => { document.getElementById(id).textContent = text; });
  }));
})();
