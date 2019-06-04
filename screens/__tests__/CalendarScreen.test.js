import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import * as auth from 'lane/backend/Auth';
import * as db from 'lane/backend/Database';

import CalendarScreen from '../CalendarScreen'

jest.mock("lane/backend/Auth", () => ({
    getIdFromEmail: jest.fn(),
}));
jest.mock("lane/backend/Database", () => ({
    onLaneUpdate: jest.fn(),
    shareLane: jest.fn(),
    deleteLane: jest.fn(),
}));

const mockNavigate = jest.fn( dest => {} );
const navigation = { navigate: mockNavigate };

Enzyme.configure({ adapter: new Adapter() });

describe('CalendarScreen', () => {
    const singleDayEmptyLane = {
        id: 'testing-lane0',
        color: '#ffffff',
        endDate: '2000-01-01',
        owner: 'testing-owner0',
        photos: {},
        startDate: '2000-01-01',
        title: 'testing-title0'
    };

    const singleDayLane = {
        id: 'testing-lane1',
        color: '#ffffff',
        endDate: '2000-01-05',
        owner: 'testing-owner1',
        photos: {id0 : {uri: 'uri', width: 100, height: 100}},
        startDate: '2000-01-01',
        title: 'testing-title1'
    }

    const setup = () => {
        const component = shallow(<CalendarScreen navigation={ navigation }/>);
        const instance = component.instance();
        return { component, instance };
    }

    const setupWithLanes = (lanes) => {
        db.onLaneUpdate.mockImplementation( process => process(lanes) );
        return setup();
    }

    beforeEach(() => {
        auth.getIdFromEmail.mockReset();
        db.onLaneUpdate.mockReset();
        db.shareLane.mockReset();
        db.deleteLane.mockReset();
    });

    it('immediately renders loading screen', () => {
        const { component, instance } = setup();
        const screen = renderer.create(instance.render()).toJSON();
        const loading = renderer.create(instance.renderLoading()).toJSON();

        expect(instance.state.loading).toBeTruthy();
        expect(screen).toEqual(loading);
        expect(screen).toMatchSnapshot();
    });

    it('did start lane listender', () => {
        const { component, instance } = setup();

        expect(db.onLaneUpdate).toHaveBeenCalled();
    });

    it('renders zero lanes correctly', () => {
        const { component, instance } = setupWithLanes([]);

        expect(Object.keys(instance.state.lanes).length).toBe(0);
        expect(Object.keys(instance.state.markings).length).toBe(0);
        expect(instance.state.loading).toBeFalsy();

        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('processes a single-day empty lane correctly', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        expect(Object.keys(instance.state.lanes).length).toBe(1);
        expect(Object.keys(instance.state.markings).length).toBe(1);
        expect(instance.state.loading).toBeFalsy();
    });

    it('selects a single-day empty lane correctly', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);
        instance.getLanes(singleDayEmptyLane.startDate);

        expect(instance.state.selectedLanes).toEqual([0]);
    });

    it('processes two lanes with 5-day span correctly', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane, singleDayLane]);

        expect(Object.keys(instance.state.lanes).length).toBe(2);
        expect(Object.keys(instance.state.markings).length).toBe(5);
        expect(instance.state.loading).toBeFalsy();

    });

    it('selects two lanes correctly', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane, singleDayLane]);

        instance.getLanes(singleDayEmptyLane.startDate);
        expect(instance.state.selectedLanes).toEqual([0, 1]);

        instance.getLanes(singleDayLane.endDate);
        expect(instance.state.selectedLanes).toEqual([1]);
    });

    it('unselects when lanes are updated', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        expect(instance.state.selectedLanes).toEqual([]);

        instance.getLanes(singleDayEmptyLane.startDate);
        expect(instance.state.selectedLanes).toEqual([0]);

        instance.processLanes([singleDayEmptyLane, singleDayLane]);
        expect(instance.state.selectedLanes).toEqual([]);
    });

    it('renders share modal', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        expect(instance.state.shareModalOpen).toBeFalsy();

        instance.onShareLane(singleDayEmptyLane);
        expect(instance.state.shareModalOpen).toBeTruthy();
        expect(instance.state.sharingId).toEqual(singleDayEmptyLane.id);
    });

    it('sends a share invitation to vaild email', () => {
        const id = 'test-id';
        const email = 'test@me.com';

        auth.getIdFromEmail.mockImplementation( (email, callback) => callback(id) );
        db.shareLane.mockImplementation( (laneId, otherUserId) => {} );
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        instance.onShareLane(singleDayEmptyLane);
        instance.onSendShare(email);

        expect(instance.state.shareModalOpen).toBeFalsy();
        expect(db.shareLane).toHaveBeenCalledWith(singleDayEmptyLane.id, id);
    });

    it('sends a share invitation to invaild email', () => {
        const email = 'test@me.com';

        auth.getIdFromEmail.mockImplementation( (email, callback) => callback(undefined) );
        db.shareLane.mockImplementation( (laneId, otherUserId) => {} );
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        instance.onShareLane(singleDayEmptyLane);
        instance.onSendShare(email);

        expect(instance.state.shareModalOpen).toBeFalsy();
        expect(db.shareLane).not.toHaveBeenCalled();
    });

    it('successfully deletes a lane', () => {
        db.deleteLane.mockImplementation( (laneId, callback) => callback() );
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        instance.onDeleteLane(singleDayEmptyLane);

        expect(db.deleteLane).toHaveBeenCalled();
    });
});