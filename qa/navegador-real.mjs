import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const web = process.env.WEB_URL ?? 'http://localhost:4200';
const api = process.env.API_URL ?? 'http://localhost:8080/api/v1';
const output = path.resolve(process.argv[2] ?? '../autoandes-backend/entrega');
await mkdir(path.join(output, 'capturas'), { recursive: true });
const cases = [], errors = [];
let browser, createdOrder, fixtureService, fixtureVehicle;
function passed(caso, detalle) { cases.push({ caso, correcto: true, ...(detalle ? { detalle } : {}) }); console.log(`OK ${caso}`); }
async function screenshot(page, filename) { await page.screenshot({ path: path.join(output, 'capturas', filename + '.png'), fullPage: true }); }
async function jsonApi(route, token, method = 'GET', body) {
  const response = await fetch(api + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}
async function login(page, user) {
  await page.goto(web + '/login');
  await page.locator('#username').fill(user);
  await page.locator('#password').fill('Auto2026*');
  const response = page.waitForResponse(r => r.url() === api + '/auth/login' && r.request().method() === 'POST');
  await page.locator('#btn-login-submit').click();
  assert.equal((await response).status(), 200);
  await page.waitForURL(url => !url.pathname.startsWith('/login'));
  await page.locator('.main-header').waitFor();
  passed(`Login navegador ${user}`);
}
async function logout(page) { await page.getByRole('button', { name: 'Salir', exact: true }).click(); await page.waitForURL('**/login'); }
async function submit(page, button, route, method, expected) {
  const pending = page.waitForResponse(r => r.url() === api + route && r.request().method() === method);
  await page.locator(button).click();
  const response = await pending;
  const data = expected === 204 ? null : await response.json();
  assert.equal(response.status(), expected, `${method} ${route}: ${JSON.stringify(data)}`);
  return data;
}
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'es-PE' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  page.setDefaultTimeout(20000);
  await page.goto(web + '/login');
  await page.locator('#username').waitFor();
  await screenshot(page, '01-login');
  await login(page, 'admin');
  const adminToken = await page.evaluate(() => JSON.parse(sessionStorage.getItem('autoandes_session')).token);
  const catalog = (await jsonApi('/servicios', adminToken)).data;
  const code = Array.from({ length: 40 }, (_, i) => `SRV-${950 + i}`).find(c => !catalog.some(s => s.codigo === c));
  assert.ok(code);
  await page.goto(web + '/servicios/nuevo');
  await page.locator('#input-codigo').fill(code);
  await page.locator('#input-nombre').fill('Servicio navegador QA');
  await page.locator('#input-precio').fill('42.50');
  await page.locator('#input-duracion').fill('45');
  await page.locator('#select-activo').selectOption({ label: 'Activo' });
  await screenshot(page, '02-crud-servicio-formulario');
  fixtureService = await submit(page, '#btn-guardar-servicio', '/servicios', 'POST', 201);
  await page.waitForURL('**/servicios');
  const search = page.getByPlaceholder('Buscar por código o nombre...');
  await search.fill(code);
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
  assert.match(await page.locator('tbody').innerText(), new RegExp(code));
  passed('CRUD servicio: alta y buscador reactivo');
  await page.locator('tbody tr').getByRole('link', { name: /Editar/ }).click();
  await page.locator('#input-precio').fill('44.75');
  await submit(page, '#btn-guardar-servicio', `/servicios/${fixtureService.id}`, 'PUT', 200);
  await page.waitForURL('**/servicios');
  await page.getByPlaceholder('Buscar por código o nombre...').fill(code);
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1);
  assert.match(await page.locator('tbody').innerText(), /44.75/);
  await screenshot(page, '03-crud-servicios');
  passed('CRUD servicio: edición con código propio');

  // Un duplicado de negocio mantiene el formulario y presenta el mensaje real.
  await page.goto(web + '/servicios/nuevo');
  await page.locator('#input-codigo').fill(catalog[0].codigo);
  await page.locator('#input-nombre').fill('Duplicado desde navegador');
  await page.locator('#input-precio').fill('20');
  await page.locator('#input-duracion').fill('30');
  await submit(page, '#btn-guardar-servicio', '/servicios', 'POST', 409);
  await page.locator('.alert-danger').first().waitFor();
  assert.equal(await page.locator('#input-nombre').inputValue(), 'Duplicado desde navegador');
  passed('409 de servicio visible y formulario conservado');

  const vehicles = (await jsonApi('/vehiculos', adminToken)).data;
  const plate = Array.from({ length: 890 }, (_, i) => `NUI-${100 + i}`).find(c => !vehicles.some(v => v.placa === c));
  assert.ok(plate);
  await page.goto(web + '/vehiculos/nuevo');
  await page.locator('#select-cliente option').nth(1).waitFor({ state: 'attached' });
  assert.match(await page.locator('#select-cliente').innerText(), /Ana Torres/);
  await page.locator('#input-placa').fill(plate);
  await page.locator('#input-marca').fill('Toyota');
  await page.locator('#input-modelo').fill('Verificación UI');
  await page.locator('#input-anio').fill('2026');
  await page.locator('#select-cliente').selectOption({ index: 1 });
  fixtureVehicle = await submit(page, '#btn-guardar-vehiculo', '/vehiculos', 'POST', 201);
  await page.waitForURL('**/vehiculos');
  await page.getByText(plate, { exact: true }).waitFor();
  await screenshot(page, '04-crud-vehiculos');
  passed('CRUD vehículo: alta con clientes reales y nombre relacionado');
  const vehicleRow = page.locator('tbody tr').filter({ hasText: plate });
  await vehicleRow.getByRole('link', { name: /Editar/ }).click();
  await page.locator('#input-modelo').fill('UI actualizado');
  await submit(page, '#btn-guardar-vehiculo', `/vehiculos/${fixtureVehicle.id}`, 'PUT', 200);
  await page.waitForURL('**/vehiculos');
  await page.locator('tbody tr').filter({ hasText: plate }).getByText('UI actualizado').waitFor();
  passed('CRUD vehículo: edición con placa propia');

  await logout(page); await login(page, 'asesor');
  assert.equal(await page.locator('app-sidebar').getByText('Reportes', { exact: true }).count(), 0);
  const asesorToken = await page.evaluate(() => JSON.parse(sessionStorage.getItem('autoandes_session')).token);
  await page.goto(web + '/ordenes/nueva');
  await page.locator('#select-vehiculo option').nth(1).waitFor({ state: 'attached' });
  await page.locator('#select-vehiculo').selectOption('1');
  await page.locator('#input-kilometraje').fill('44999');
  await page.locator('.detalle-line select').nth(0).selectOption('1');
  await page.locator('.detalle-line input[type=number]').nth(0).fill('2');
  await page.locator('#btn-agregar-detalle').click();
  await page.locator('.detalle-line select').nth(1).selectOption('2');
  assert.equal(await page.locator('.detalle-line select').nth(1).locator('option[value="1"]').count(), 0);
  await page.waitForFunction(() => document.querySelector('#display-total-orden').textContent.includes('320.00'));
  await submit(page, '#btn-guardar-orden', '/ordenes', 'POST', 409);
  assert.equal(await page.locator('.detalle-line').count(), 2);
  assert.equal(await page.locator('.detalle-line input[type=number]').nth(0).inputValue(), '2');
  await page.getByText(/45000/).first().waitFor();
  passed('Orden: FormArray, total reactivo, sin repetidos y409 conserva líneas');
  await page.locator('#select-vehiculo').selectOption(String(fixtureVehicle.id));
  await page.locator('#input-kilometraje').fill('50000');
  await screenshot(page, '05-orden-cabecera-detalle');
  createdOrder = await submit(page, '#btn-guardar-orden', '/ordenes', 'POST', 201);
  assert.equal(createdOrder.total, 320); assert.equal(createdOrder.usuarioRegistro, 'asesor');
  assert.match(createdOrder.numero, /^OS-\d{6}$/);
  await page.getByText(new RegExp(createdOrder.numero)).waitFor();
  passed('Orden registrada: número y total del servidor', createdOrder.numero);
  await page.goto(web + `/ordenes/${createdOrder.id}`);
  await page.getByText(createdOrder.numero, { exact: false }).first().waitFor();
  assert.equal(await page.locator('#btn-iniciar-anular').count(), 0);
  await screenshot(page, '06-orden-registrada');
  passed('ASESOR no ve anulación');
  const denialPage = await context.newPage();
  await denialPage.setExtraHTTPHeaders({ Authorization: `Bearer ${asesorToken}` });
  const denialResponse = await denialPage.goto(api + '/reportes/ingresos-por-servicio');
  assert.equal(denialResponse.status(), 403);
  await screenshot(denialPage, '07-rechazo-403');
  await denialPage.close(); passed('403 real: ASESOR no consulta reporte');
  await logout(page); await login(page, 'jefe');
  await page.goto(web + '/ordenes/nueva');
  await page.waitForURL('**/acceso-denegado');
  await page.getByText('Acceso denegado', { exact: false }).first().waitFor();
  assert.ok(await page.evaluate(() => sessionStorage.getItem('autoandes_session')));
  await screenshot(page, '08-acceso-denegado');
  passed('URL manual sin permiso: guard deniega y conserva sesión');
  await page.goto(web + '/reportes');
  await page.locator('tbody tr').first().waitFor();
  await screenshot(page, '09-reporte-ingresos');
  passed('Reporte real visible con JEFE_TALLER');
  await page.goto(web + `/ordenes/${createdOrder.id}`);
  await page.locator('#btn-iniciar-anular').click();
  await page.locator('#textarea-motivo').fill('Anulación de prueba integral de navegador');
  await submit(page, '#btn-confirmar-anular', `/ordenes/${createdOrder.id}/anular`, 'PATCH', 200);
  await page.getByText('ANULADA', { exact: true }).waitFor();
  passed('Anulación real desde interfaz');
  await page.evaluate(() => { const s = JSON.parse(sessionStorage.getItem('autoandes_session')); s.token = s.token.slice(0, -8) + 'AAAAAAAA'; sessionStorage.setItem('autoandes_session', JSON.stringify(s)); });
  await page.goto(web + '/reportes');
  await page.waitForURL(/\/login\?returnUrl=/);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('autoandes_session')), null);
  passed('JWT alterado: interceptor401 cierra y conserva returnUrl');
  await login(page, 'admin');
  await page.evaluate(() => { const s = JSON.parse(sessionStorage.getItem('autoandes_session')); s.expiresAt = Date.now() + 1500; sessionStorage.setItem('autoandes_session', JSON.stringify(s)); });
  await page.goto(web + '/servicios');
  await page.waitForURL(url => url.pathname === '/login');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('autoandes_session')), null);
  passed('Vencimiento guardado: cierre automático de sesión');
  assert.deepEqual(errors, [], 'Sin errores de ejecución Angular');
  passed('Sin errores JavaScript en navegador');
  // Quitar solo el servicio propio sin referencias. El vehículo y la orden anulada conservan historial.
  const token = (await jsonApi('/auth/login', null, 'POST', { username: 'admin', password: 'Auto2026*' })).data.token;
  assert.equal((await jsonApi(`/servicios/${fixtureService.id}`, token, 'DELETE')).status, 204);
  passed('Limpieza servicio de prueba sin historial');
} catch (error) {
  cases.push({ caso: 'Fallo de navegador', correcto: false, mensaje: error.message });
  console.error(error.stack); process.exitCode = 1;
  if (browser) { const page = browser.contexts()[0]?.pages()[0]; if (page) await screenshot(page, 'fallo-qa').catch(() => {}); }
} finally {
  if (browser) await browser.close();
  const result = { fecha: new Date().toISOString(), web, api, total: cases.length, aprobadas: cases.filter(x => x.correcto).length, fallidas: cases.filter(x => !x.correcto).length, orden: createdOrder?.numero, placaPrueba: fixtureVehicle?.placa, casos: cases, erroresJavascript: errors };
  await writeFile(path.join(output, 'qa-navegador.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`Navegador: ${result.aprobadas}/${result.total}`);
}
