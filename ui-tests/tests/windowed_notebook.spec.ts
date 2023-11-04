import { expect, galata, test } from '@jupyterlab/galata';
import { openNotebook, cleanup } from './utils';

test.describe('Windowed notebook support', () => {
  test.use({
    mockSettings: {
      ...galata.DEFAULT_SETTINGS,
      '@jupyterlab/notebook-extension:tracker': {
        ...galata.DEFAULT_SETTINGS['@jupyterlab/notebook-extension:tracker'],
        windowingMode: 'full',
      },
    },
  });
  test.beforeEach(openNotebook('100_code_cells.ipynb'));
  test.afterEach(cleanup);

  test('Node attachment after scrolling into view', async ({ page }) => {
    await page.notebook.run();
    // Check that only a fraction of cells have the widget
    expect(await page.locator('.execute-time').count()).toBeLessThan(50);
    // Get the 100th cells locator without scrolling
    const lastCellLocator = page.locator('.jp-Cell:last-child');
    expect(await lastCellLocator.isHidden()).toBeTruthy();
    const widgetLocator = lastCellLocator.locator('.execute-time');
    expect(await widgetLocator.isHidden()).toBeTruthy();
    // Scroll to the 100th cell
    await page.notebook.getCell(100);
    // The widget should not be shown
    expect(await widgetLocator.isHidden()).toBeFalsy();
    // The widget should be in "executed" state
    expect(await widgetLocator.textContent()).toContain('Last executed at');
  });
});
