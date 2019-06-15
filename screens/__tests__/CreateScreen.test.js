import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { Permissions } from 'expo';

import * as auth from 'lane/backend/Auth';
import * as db from 'lane/backend/Database';

import ImageBrowser from 'lane/components/image_picker/ImageBrowser';

import Photo from 'lane/models/Photo';

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

    it('successfully handle done with one picture', () => {
        const id = 'testid';
        const laneid = 'laneid';
        const title = 'title';
        const photo = new Photo('uri', 100, 100, '5', 0);

        const color = '#ffffff';

        auth.getUserID.mockImplementation( () => { return id; } );
        db.pushLane.mockImplementation( (ownerId, laneObj) => { return laneid; } );
        db.uploadImageAsync.mockImplementation( (photo, laneId) => {} );
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
            expect(db.uploadImageAsync).toHaveBeenCalledWith(photo, laneid);
            expect(db.addLaneToUser).toHaveBeenCalledWith(id, laneid);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('successfully handle done with multiple pictures', () => {
        const id = 'testid';
        const laneid = 'laneid';
        const title = 'title';
        const photos = [new Photo('uri1', 100, 100, '1', 0), new Photo('uri2', 100, 100, '2', 86400)];
        const color = '#ffffff';

        auth.getUserID.mockImplementation( () => { return id; } );
        db.pushLane.mockImplementation( (ownerId, laneObj) => { return laneid; } );
        db.uploadImageAsync.mockImplementation( (photo, laneId, ) => {} );
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
            expect(db.uploadImageAsync).toHaveBeenCalledWith(photos[0], laneid);
            expect(db.uploadImageAsync).toHaveBeenCalledWith(photos[1], laneid);
            expect(db.addLaneToUser).toHaveBeenCalledWith(id, laneid);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

});