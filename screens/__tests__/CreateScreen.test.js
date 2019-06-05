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
        Permissions.askAsync.mockReset();
    });

    it('renders empty create screen correctly', () => {
        const { component, instance } = setup();
        const screen = renderer.create(instance.render()).toJSON();
        const loading = renderer.create(instance.renderImageBrowser()).toJSON();
        const imageBrowser = renderer.create(instance.renderLoading()).toJSON();

        expect(screen).toMatchSnapshot();
        expect(screen).not.toEqual(loading);
        expect(screen).not.toEqual(imageBrowser);
    });

    it('renders top nav correctly', () => {
        const { component, instance } = setup();
        const topNav = renderer.create(instance.renderTopNav()).toJSON();

        expect(topNav).toMatchSnapshot();
    });

    it('renders color modal correctly', () => {
        const { component, instance } = setup();
        const colorModal = renderer.create(instance.renderColorModal()).toJSON();

        expect(colorModal).toMatchSnapshot();
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

    it('renders image browser if image_browser_open is true in state', () => {
        const { component, instance } = setup();
        const imageBrowser = renderer.create(instance.renderImageBrowser()).toJSON();

        instance.state.imageBrowserOpen = true;
        const screen = renderer.create(instance.render()).toJSON();

        expect(screen).toEqual(imageBrowser);
    });

    it('alerts if permissions throws error', () => {
        Permissions.askAsync.mockImplementation( permission => { throw 'lolol'; } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then(data => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('alerts if permissions returns false', () => {
        Permissions.askAsync.mockImplementation( permission => { return {status: 'error'} } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then(data => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('opens image browser if permissions returns true', () => {
        Permissions.askAsync.mockImplementation( permission => { return {status: 'granted'} } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then( () => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeFalsy();
            expect(instance.state.imageBrowserOpen).toBeTruthy();
        });
    });

    it('adds selected photos to state', () => {
        const { component, instance } = setup();
        const photos = [{image: { uri: 'uri1', width: 100, height: 100 }}, {image: { uri: 'uri2',  width: 100, height: 100 }}];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });

        instance.imageBrowserCallback(photoPromise, {})
        photoPromise.then( () => {
            expect(instance.state.imageBrowserOpen).toBeFalsy();
            expect(instance.state.photos).toEqual(photos);
        });
    });

    it('removes deselected photos from state', () => {
        const { component, instance } = setup();
        const photos = [{image: { uri: 'uri1', width: 100, height: 100 }}, {image: { uri: 'uri2',  width: 100, height: 100 }}];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });

        instance.imageBrowserCallback(photoPromise, {uri2: true})
        photoPromise.then( () => {
            expect(instance.state.imageBrowserOpen).toBeFalsy();
            expect(instance.state.photos).toEqual([photos[0]]);
        });
    });

    it('alerts if handle done received no title', () => {
        const { component, instance } = setup();

        return instance.handleDone().then( () => {
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('alerts if handle done received no title', () => {
        const { component, instance } = setup();
        instance.state.title = 'title';

        return instance.handleDone().then( () => {
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
        }
        auth.getUserID.mockImplementation( () => { return id; } );
        db.pushLane.mockImplementation( (ownerId, laneObj) => { return laneid; } );
        db.uploadImageAsync.mockImplementation( (laneId, photo) => {} );
        db.addLaneToUser.mockImplementation( (userId, laneId) => {} );

        const { component, instance } = setup();
        instance.state.title = title;
        instance.state.photos = [photo]

        return instance.handleDone().then( () => {
            expect(instance.state.snackVisible).toBeFalsy();
            expect(auth.getUserID).toHaveBeenCalled();
            expect(db.pushLane).toHaveBeenCalledWith(id, {
                title: 'title',
                startDate: '1970-01-01',
                endDate: '1970-01-01',
                color: '#6200ee',
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
            uri: 'uri1',
            md5: '1',
            image: {
                width: 100,
                height: 100
            }
        }, {
            timestamp: 86400,
            uri: 'uri2',
            md5: '2',
            image: {
                width: 100,
                height: 100
            }
        }]
        auth.getUserID.mockImplementation( () => { return id; } );
        db.pushLane.mockImplementation( (ownerId, laneObj) => { return laneid; } );
        db.uploadImageAsync.mockImplementation( (laneId, photo) => {} );
        db.addLaneToUser.mockImplementation( (userId, laneId) => {} );

        const { component, instance } = setup();
        instance.state.title = title;
        instance.state.photos = photos;

        return instance.handleDone().then( () => {
            expect(instance.state.snackVisible).toBeFalsy();
            expect(auth.getUserID).toHaveBeenCalled();
            expect(db.pushLane).toHaveBeenCalledWith(id, {
                title: 'title',
                startDate: '1970-01-01',
                endDate: '1970-01-02',
                color: '#6200ee',
            });
            expect(db.uploadImageAsync).toHaveBeenCalledTimes(2);
            expect(db.uploadImageAsync).toHaveBeenCalledWith(laneid, photos[0]);
            expect(db.uploadImageAsync).toHaveBeenCalledWith(laneid, photos[1]);
            expect(db.addLaneToUser).toHaveBeenCalledWith(id, laneid);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

});