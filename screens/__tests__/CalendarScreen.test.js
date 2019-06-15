import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import * as auth from 'lane/backend/Auth';
import * as db from 'lane/backend/Database';

import Lane from 'lane/models/Lane';

import * as timeTools from 'lane/utils/TimeTools';

import CalendarScreen from '../CalendarScreen'

jest.mock("lane/backend/Auth", () => ({
    getIdFromEmail: jest.fn(),
}));
jest.mock("lane/backend/Database", () => ({
    onLaneUpdate: jest.fn(),
    shareLane: jest.fn(),
    deleteLane: jest.fn(),
}));

timeTools.getYear = jest.fn( () => 2019 );

const mockNavigate = jest.fn( dest => {} );
const navigation = { navigate: mockNavigate };

Enzyme.configure({ adapter: new Adapter() });

describe('CalendarScreen', () => {
    const singleDayEmptyLane = new Lane('testing-lane0', 'testing-title0', 'testing-owner0', '2019-01-02', '2019-01-02', '#ffffff', {});
    const singlePicLane = new Lane('testing-lane1', 'testing-title1', 'testing-owner1', '2019-01-02', '2019-01-06', '#ffffff', {id0 : {uri: 'uri', width: 100, height: 100}});
    const pastLane = new Lane('old-lane0', 'old-title0', 'old-owner0', '2018-01-02', '2018-01-02', '#ffffff', {});

    const setup = () => {
        const component = shallow(<CalendarScreen navigation={ navigation }/>);
        const instance = component.instance();
        return { component, instance };
    }

    const setupWithLanes = (lanes) => {
        db.onLaneUpdate.mockImplementation( process => lanes.map(l => process(l)) );
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
        const { component, instance } = setupWithLanes([undefined]);

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

        expect(instance.state.selectedLanes).toEqual(['testing-lane0']);
    });

    it('processes two lanes with 5-day span correctly', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane, singlePicLane]);

        expect(Object.keys(instance.state.lanes).length).toBe(2);
        expect(Object.keys(instance.state.markings).length).toBe(5);
        expect(instance.state.loading).toBeFalsy();
    });

    it('selects two lanes correctly', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane, singlePicLane]);

        instance.getLanes(singleDayEmptyLane.startDate);
        expect(instance.state.selectedLanes).toEqual(['testing-lane0', 'testing-lane1']);

        instance.getLanes(singlePicLane.endDate);
        expect(instance.state.selectedLanes).toEqual(['testing-lane1']);
    });

    it('unselects when lanes are updated', () => {
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        expect(instance.state.selectedLanes).toEqual([]);

        instance.getLanes(singleDayEmptyLane.startDate);
        expect(instance.state.selectedLanes).toEqual(['testing-lane0']);

        instance.processLane(singleDayEmptyLane);
        instance.processLane(singlePicLane);

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
        expect(instance.state.snackVisible).toBeTruthy();
        expect(instance.state.snackMessage).toEqual('Email doesn\'t exist!');
    });

    it('successfully deletes a lane', () => {
        db.deleteLane.mockImplementation( (laneId, callback) => callback() );
        const { component, instance } = setupWithLanes([singleDayEmptyLane]);

        instance.onDeleteLane(singleDayEmptyLane);

        expect(db.deleteLane).toHaveBeenCalled();
    });

    it('propagates a one year old lane correctly', () => {
        const { component, instance } = setupWithLanes([pastLane]);

        expect(Object.keys(instance.state.lanes).length).toBe(1);
        expect(Object.keys(instance.state.markings).length).toBe(2);
    });

    it('can select a one year old propagated lane correctly', () => {
        const { component, instance } = setupWithLanes([pastLane]);

        instance.getLanes('2019-01-02');
        expect(instance.state.selectedLanes).toEqual(['old-lane0']);
    })
});