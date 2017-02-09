
		var itemsModel, db = nwCustomersWithOrders;

		var Item = function (ID, ContactName, City, Country) {
			var self = this;
			this.ID = ko.observable(ID);
			this.ContactName = ko.observable(ContactName);
			this.City = ko.observable(City);
			this.Country = ko.observable(Country);
		}

		function ItemsViewModel() {
			var self = this;
			self.data = ko.observableArray([]);
			self.selectedItemID = ko.observable(0);

			for (var i = 0; i < db.length; i++) {
				self.data.push(new Item(db[i].ID, db[i].ContactName, db[i].City, db[i].Country));
			}

			self.selectionChanged = function (evt, ui) {
				var rowdata = ui.row;
				// find it in the array so we don't lose the observables
				var selectedItemInArray = ko.utils.arrayFirst(self.data(), function (item) {
					return item.ID() === rowdata.id;
				});

				if (selectedItemInArray != null) {
					self.selectedItemID(parseInt(rowdata.index));
				}
				else {
					self.selectedItemID(0);
				}
			};
		}

		$(function () {
			// Used to show output in the API Viewer at runtime,
			// defined in external script 'apiviewer.js'
			var apiViewer = new $.ig.apiViewer();

			itemsModel = new ItemsViewModel();
			ko.applyBindings(itemsModel);
		});
	