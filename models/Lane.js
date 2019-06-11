export default class Lane {
    constructor(id, title, owner, startDate, endDate, color, photos) {
        this.id = id; // string
        this.title = title; // string
        this.owner = owner; // string
        this.startDate = startDate; // string
        this.endDate = endDate; // string
        this.color = color; // string
        this.photos = photos; // dictionary { id : Photo }
    }
}