import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

import { rational } from '~/rational/rational';
import { BeaconSettings } from '~/state/beacon-settings';
import { ModuleSettings } from '~/state/module-settings';
import { Options } from '~/state/options';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce, notNullish } from '~/utils/nullish';
import { spread } from '~/utils/object';

import { Button } from '../button/button';
import { Control } from '../control';
import { Dropdown } from '../dropdown/dropdown';
import { Icon } from '../icon/icon';
import { InputNumber } from '../input-number/input-number';
import { Modules } from '../modules/modules';
import { Rounded } from '../rounding';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';

let nextUniqueId = 0;

@Component({
  selector: 'lab-beacons-select',
  imports: [
    FormsModule,
    Button,
    Dropdown,
    Icon,
    InputNumber,
    Modules,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './beacons-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: BeaconsSelect,
    },
    { provide: Control, useExisting: BeaconsSelect },
  ],
  host: { class: 'flex' },
})
export class BeaconsSelect extends Control<BeaconSettings[]> {
  private readonly options = inject(Options);
  protected readonly settingsStore = inject(SettingsStore);

  private readonly uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-beacons-select-${this.uniqueId}`);
  readonly value = model<BeaconSettings[]>();
  readonly disabled = model(false);
  readonly labelledBy = input<string>();
  readonly border = input(true);
  readonly rounded = input<Rounded>('all');

  protected readonly editValue = linkedSignal(() => coalesce(this.value(), []));

  protected readonly faPlus = faPlus;
  protected readonly faXmark = faXmark;

  open(): void {
    this.editValue.set(coalesce(this.value(), []));
  }

  save(): void {
    this.setValue(this.editValue());
  }

  setField<F extends keyof BeaconSettings>(
    i: number,
    field: F,
    value: BeaconSettings[F],
  ): void {
    this.editValue.update((values) =>
      values.map((v, j) => {
        if (j !== i) return v;
        if (field === 'id' && typeof value === 'string') {
          const data = this.settingsStore.dataset();
          const beacon = data.beaconRecord[value];
          const allowedIds = new Set(
            this.options
              .moduleOptions(beacon, this.settingsStore.settings(), data)
              .map((o) => o.value),
          );
          let remaining = beacon.modules;
          const modules: ModuleSettings[] = [];
          for (const m of coalesce(v.modules, [])) {
            if (!m.id || !allowedIds.has(m.id)) continue;
            const count = coalesce(m.count, rational.zero).min(remaining);
            if (count.gt(rational.zero)) {
              modules.push({ id: m.id, count });
              remaining = remaining.sub(count);
            }
          }
          if (remaining.gt(rational.zero)) {
            modules.push({ id: '', count: remaining });
          }
          return spread(v, { [field]: value, modules });
        }
        return spread(v, { [field]: value });
      }),
    );
  }

  removeEntry(i: number): void {
    this.editValue.update((v) => v.filter((_, j) => i !== j));
  }

  addEntry(): void {
    this.editValue.update((v) => {
      v ??= [];
      const usedIds = new Set(v.map((b) => b.id).filter(notNullish));
      const beacons = this.settingsStore.options().beacons;
      const id = (beacons.find((b) => !usedIds.has(b.value)) ?? beacons[0])
        .value;
      const count = this.settingsStore.dataset().beaconRecord[id].modules;
      const total = this.settingsStore.settings().beaconReceivers;
      return [
        ...v,
        {
          id,
          count: rational.zero,
          total,
          modules: [{ id: '', count }],
        },
      ];
    });
  }
}
