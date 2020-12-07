import { RequestParams, SyncResource, User } from './src';
import { Observable } from 'rxjs';

const timeTacApi = {
  init: function (sinceMap: { [hash: string]: Date }, onUpdateSinceMap: (sinceMap: { [hash: string]: Date }) => void) {},
  users: {
    sync: async function (
      requestParams: RequestParams<User>,
      since: 'last' | Date | undefined,
      onPageReceived: (data: User[], deleted: string[]) => void
    ): Promise<{ newSince: Date }> {
      return { newSince: new Date() };
    },
  },
};

const dispatch = (action: any) => {};
const usersSlice: any = {};
const sinceMapUpdated: any = null;

// How to use client library

// Init
const map: { [hash: string]: Date } = {};
timeTacApi.init(map, (map) => dispatch(sinceMapUpdated(map)));

// Fetch all users
timeTacApi.users
  .sync(new RequestParams<User>(), 'last', (data) => dispatch(usersSlice.receive(data)))
  .then((newSince) => dispatch(usersSlice.completeSync()));

// Deltasync users since last request
timeTacApi.users
  .sync(new RequestParams<User>(), 'last', (data) => dispatch(usersSlice.receive(data)))
  .then((newSince) => dispatch(usersSlice.completeSync()));

// Fetch all users from scratch
timeTacApi.users
  .sync(new RequestParams<User>(), undefined, (data) => dispatch(usersSlice.receive(data)))
  .then((newSince) => dispatch(usersSlice.completeSync()));

// Fetch all users since this year
timeTacApi.users
  .sync(new RequestParams<User>(), new Date(2020, 1, 1), (data) => dispatch(usersSlice.receive(data)))
  .then((newSince) => dispatch(usersSlice.completeSync()));

// Deltasync users since last request
timeTacApi.users
  .sync(new RequestParams<User>(), 'last', (data) => dispatch(usersSlice.receive(data)))
  .then((newSince) => dispatch(usersSlice.completeSync()));

// In core, with RxJS

function toObservable<T>(
  syncFunction: (
    requestParams: RequestParams<T>,
    since: 'last' | Date | undefined,
    onPageReceived: (data: T[], deleted: string[]) => void
  ) => Promise<{ newSince: Date }>
): (requestParams: RequestParams<T>, since: 'last' | Date | undefined) => Observable<{ data: T[]; deleted: string[] }> {
  return (requestParams: RequestParams<T>, since: 'last' | Date | undefined) =>
    new Observable((subscriber) => {
      syncFunction(requestParams, since, (data, deleted) => subscriber.next({ data, deleted }))
        .then((newSince) => subscriber.complete())
        .catch((error) => subscriber.error(error));
    });
}
