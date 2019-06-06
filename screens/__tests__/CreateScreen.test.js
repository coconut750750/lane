import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { Permissions } from 'expo';

import * as auth from 'lane/backend/Auth';
import * as db from 'lane/backend/Database';

import ImageBrowser from 'lane/components/image_picker/ImageBrowser';

import CreateScreen from '../CreateScreen'

jest.mock('lane/backend/Auth', () => ({
    getUserID: jest.fn(),
}));

jest.mock('lane/backend/Database', () => ({
    pushLane: jest.fn(),
    uploadImageAsync: jest.fn(),
    addLaneToUser: jest.fn(),
}));

jest.mock('lane/components/image_picker/ImageBrowser', () => 'imagebrowser' );

jest.mock('expo', () => ({
    Permissions: {
        askAsync: jest.fn(),
    }
}));

const mockGoBack = jest.fn( () => {} );
const navigation = { goBack: mockGoBack };

Enzyme.configure({ adapter: new Adapter() });

describe('CreateScreen', () => {
    const setup = () => {
        const component = shallow(<CreateScreen navigation={ navigation }/>);
        const instance = component.instance();
        return { component, instance };
    }

    beforeEach(() => {
        auth.getUserID.mockReset();
        db.pushLane.mockReset();
        db.uploadImageAsync.mockReset();
        db.addLaneToUser.mockReset();
    });

    it('renders empty create screen correctly', () => {
        const { component, instance } = setup();
        const screen = renderer.create(instance.render()).toJSON();
        const loading = renderer.create(instance.renderLoading()).toJSON();

        expect(screen).not.toEqual(loading);
        expect(screen).toMatchSnapshot();
    });

    it('renders loading screen correctly', () => {
        const { component, instance } = setup();
        const loadingScreen = renderer.create(instance.renderLoading()).toJSON();

        expect(loadingScreen).toMatchSnapshot();
    });

    it('renders loading if state is uploading', () => {
        const { component, instance } = setup();
        const loadingScreen = renderer.create(instance.renderLoading()).toJSON();

        instance.state.uploading = true;
        const screen = renderer.create(instance.render()).toJSON();

        expect(screen).toEqual(loadingScreen);
    });

    it('alerts if handle done received no title', () => {
        const title = '';
        const photos = [];
        const color = '#ffffff';
        const { component, instance } = setup();

        return instance.handleDone(title, photos, color).then( () => {
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('alerts if handle done received no photos', () => {
        const title = 'title';
        const photos = [];
        const color = '#ffffff';
        const { component, instance } = setup();

        return instance.handleDone(title, photos, color).then( () => {
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('successfully handle done with one picture', () => {
        const id = 'testid';
        const laneid = 'laneid';
        const title = 'title';
        const photo = {
            timestamp: 0,
            uri: 'uri',
            md5: '5',
            image: {
                width: 100,
                height: 100
            }
        };
        const color = '#ffffff';

        auth.getUserID.mockImplementation( () => { return id; } );
        db.pushLane.mockImplementation( (ownerId, laneObj) => { return laneid; } );
        db.uploadImageAsync.mockImplementation( (laneId, photo) => {} );
        db.addLaneToUser.mockImplementation( (userId, laneId) => {} );

        const { component, instance } = setup();

        return instance.handleDone(title, [photo], color).then( () => {
            expect(instance.state.snackVisible).toBeFalsy();
            expect(auth.getUserID).toHaveBeenCalled();
            expect(db.pushLane).toHaveBeenCalledWith(id, {
                title: 'title',
                startDate: '1970-01-01',
                endDate: '1970-01-01',
                color: color,
            });
            expect(db.uploadImageAsync).toHaveBeenCalledTimes(1);
            expect(db.uploadImageAsync).toHaveBeenCalledWith(laneid, photo);
            expect(db.addLaneToUser).toHaveBeenCalledWith(id, laneid);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('successfully handle done with multiple pictures', () => {
        const id = 'testid';
        const laneid = 'laneid';
        const title = 'title';
        const photos = [{
            timestamp: 0,
            md5: '1',
            image: {
                width: 100,
                height: 100,
                uri: 'uri1',
            }
        }, {
            timestamp: 86400,
            md5: '2',
            image: {
                width: 100,
                height: 100,
                uri: 'uri2',
            }
        }];
        const color = '#ffffff';

        auth.getUserID.mockImplementation( () => { return id; } );
        db.pushLane.mockImplementation( (ownerId, laneObj) => { return laneid; } );
        db.uploadImageAsync.mockImplementation( (laneId, photo) => {} );
        db.addLaneToUser.mockImplementation( (userId, laneId) => {} );

        const { component, instance } = setup();

        return instance.handleDone(title, photos, color).then( () => {
            expect(instance.state.snackVisible).toBeFalsy();
            expect(auth.getUserID).toHaveBeenCalled();
            expect(db.pushLane).toHaveBeenCalledWith(id, {
                title: 'title',
                startDate: '1970-01-01',
                endDate: '1970-01-02',
                color: color,
            });
            expect(db.uploadImageAsync).toHaveBeenCalledTimes(2);
            expect(db.uploadImageAsync).toHaveBeenCalledWith(laneid, photos[0]);
            expect(db.uploadImageAsync).toHaveBeenCalledWith(laneid, photos[1]);
            expect(db.addLaneToUser).toHaveBeenCalledWith(id, laneid);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

});