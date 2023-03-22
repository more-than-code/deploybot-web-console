export type ParamsType  = {
  [k: string]: string
}

export function SubmitViaForm(action: string, method: string, params: ParamsType) {
  const form = document.createElement('form');
  form.method = method;
  form.action = action;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}