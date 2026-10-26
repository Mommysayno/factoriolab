import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { mockBeaconSettings } from '~/tests/mocks/settings';
import { TestModule } from '~/tests/test-module';

import { BeaconsSelect } from './beacons-select';

describe('BeaconsSelect', () => {
  let component: BeaconsSelect;
  let fixture: ComponentFixture<BeaconsSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, BeaconsSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(BeaconsSelect);
    component = fixture.componentInstance;
    component.value.set(mockBeaconSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('should reset the editValue', () => {
      spyOn(component['editValue'], 'set');
      component.open();
      expect(component['editValue'].set).toHaveBeenCalledWith(
        mockBeaconSettings,
      );
    });
  });

  describe('save', () => {
    it('should write the new value', () => {
      spyOn(component, 'setValue');
      component.save();
      expect(component.setValue).toHaveBeenCalledWith(mockBeaconSettings);
    });
  });

  describe('setField', () => {
    it('should update the signal', () => {
      component.setField(0, 'count', rational.zero);
      expect(component['editValue']()[0].count).toEqual(rational.zero);
    });

    it('should clamp and filter modules when beacon id changes', () => {
      component['editValue'].set([
        {
          id: ItemId.Beacon,
          count: rational.one,
          modules: [
            { id: ItemId.ProductivityModule3, count: rational.one },
            { id: ItemId.SpeedModule3, count: rational.one },
            { id: '', count: rational.one },
          ],
        },
        {
          id: ItemId.Beacon,
          count: rational.one,
          modules: [
            { id: ItemId.SpeedModule3, count: rational(2n) },
            { id: ItemId.EfficiencyModule3, count: rational.one },
          ],
        },
      ]);
      component.setField(0, 'id', ItemId.Beacon);
      expect(component['editValue']()[0].modules).toEqual([
        { id: ItemId.SpeedModule3, count: rational.one },
        { id: '', count: rational.one },
      ]);

      component.setField(1, 'id', ItemId.Beacon);
      expect(component['editValue']()[1].modules).toEqual([
        { id: ItemId.SpeedModule3, count: rational(2n) },
      ]);
    });
  });

  describe('removeEntry', () => {
    it('should update the signal', () => {
      component.removeEntry(0);
      expect(component['editValue']()).toEqual([mockBeaconSettings[1]]);
    });
  });

  describe('addEntry', () => {
    it('should update the signal', () => {
      component.addEntry();
      expect(component['editValue']()).toHaveSize(3);

      component['editValue'].set([]);
      component.addEntry();
      expect(component['editValue']()).toHaveSize(1);
    });
  });
});
