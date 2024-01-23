import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';

const VENDOR_QUEUE_KEY = 'vendors-queue';
const LOCK_VENDOR_SELECT = 'lock-vendor-select';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('vendors') private readonly vendorsModel: Model<any>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.cacheManager.set(LOCK_VENDOR_SELECT, false);
    this.buildVendorsQueue().then((_) => console.log('Vendors Queue Loaded'));
  }

  private async buildVendorsQueue(): Promise<Array<any>> {
    const vendors = await this.vendorsModel.find({ status: true }).sort({
      weight: -1,
    });

    const data = vendors.map(({ _doc: vendor }) => ({
      ...vendor,
      currentWeight: vendor.weight,
    }));

    await this.cacheManager.set(VENDOR_QUEUE_KEY, JSON.stringify(data));

    return data;
  }

  async getResponsible() {
    const lockingRun = await this.cacheManager.get(LOCK_VENDOR_SELECT);

    if (lockingRun) {
      this.getResponsible();
    }

    await this.cacheManager.set(LOCK_VENDOR_SELECT, true);

    const cacheString = (await this.cacheManager.get(
      VENDOR_QUEUE_KEY,
    )) as string;

    const cacheData = JSON.parse(cacheString) as Array<any>;

    let vendorsQueue = cacheData
      .filter((vend) => vend.currentWeight > 0)
      .sort((a, b) => b.currentWeight - a.currentWeight);

    if (!vendorsQueue.length) {
      vendorsQueue = await this.buildVendorsQueue();
    }

    const vendorSelect = vendorsQueue[0];

    vendorsQueue[0].currentWeight -= 1;

    await this.cacheManager.set(VENDOR_QUEUE_KEY, JSON.stringify(vendorsQueue));

    await this.cacheManager.set(LOCK_VENDOR_SELECT, false);

    return {
      vendorSelect,
      vendorsQueue: vendorsQueue.filter((vend) => vend.currentWeight > 0),
    };
  }
}
