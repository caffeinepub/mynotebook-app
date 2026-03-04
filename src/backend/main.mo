import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  // Types
  public type Note = {
    id : Text;
    title : Text;
    content : Text;
    createdAt : Int;
    updatedAt : Int;
    pinned : Bool;
    imageUrls : [Text];
  };

  public type UserProfile = {
    name : Text;
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      if (note1.pinned and not note2.pinned) {
        #less;
      } else if (not note1.pinned and note2.pinned) {
        #greater;
      } else {
        Text.compare(note1.title, note2.title);
      };
    };
  };

  // State - per-user note storage
  let userNotes = Map.empty<Principal, Map.Map<Text, Note>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextNoteId : Nat = 0;

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to get or create user's note map
  func getUserNotesMap(user : Principal) : Map.Map<Text, Note> {
    switch (userNotes.get(user)) {
      case (?notes) { notes };
      case (null) {
        let newMap = Map.empty<Text, Note>();
        userNotes.add(user, newMap);
        newMap;
      };
    };
  };

  // Helper function to generate unique note ID
  func generateNoteId() : Text {
    nextNoteId += 1;
    Nat.toText(nextNoteId);
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Note Functions
  public shared ({ caller }) func createNote(title : Text, content : Text) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create notes");
    };

    let id = generateNoteId();
    let note : Note = {
      id;
      title;
      content;
      createdAt = Time.now();
      updatedAt = Time.now();
      pinned = false;
      imageUrls = [];
    };

    let notes = getUserNotesMap(caller);
    notes.add(id, note);
    note;
  };

  public shared ({ caller }) func updateNote(id : Text, title : Text, content : Text) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update notes");
    };

    let notes = getUserNotesMap(caller);
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note does not exist") };
      case (?note) {
        let updatedNote = {
          note with
          title;
          content;
          updatedAt = Time.now();
        };
        notes.add(id, updatedNote);
        updatedNote;
      };
    };
  };

  public shared ({ caller }) func deleteNote(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete notes");
    };

    let notes = getUserNotesMap(caller);
    if (not notes.containsKey(id)) {
      Runtime.trap("Note does not exist");
    };
    notes.remove(id);
  };

  public query ({ caller }) func getNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access notes");
    };

    let notes = getUserNotesMap(caller);
    let notesArray = notes.values().toArray();
    notesArray.sort();
  };

  public query ({ caller }) func getNote(id : Text) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access notes");
    };

    let notes = getUserNotesMap(caller);
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note does not exist") };
      case (?note) { note };
    };
  };

  public query ({ caller }) func searchNotes(searchTerm : Text) : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search notes");
    };

    let notes = getUserNotesMap(caller);
    notes.values().toArray().filter(
      func(note : Note) : Bool {
        note.title.contains(#text searchTerm) or note.content.contains(#text searchTerm);
      }
    );
  };

  public shared ({ caller }) func togglePin(id : Text) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle pin");
    };

    let notes = getUserNotesMap(caller);
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note does not exist") };
      case (?note) {
        let updatedNote = {
          note with
          pinned = not note.pinned;
        };
        notes.add(id, updatedNote);
        updatedNote;
      };
    };
  };

  // Image Functions (Blobs)
  public shared ({ caller }) func addImageToNote(
    noteId : Text,
    imageUrl : Text
  ) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add images");
    };

    let notes = getUserNotesMap(caller);
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note does not exist") };
      case (?note) {
        let updatedNote = {
          note with
          imageUrls = note.imageUrls.concat([imageUrl]);
        };
        notes.add(noteId, updatedNote);
        updatedNote;
      };
    };
  };

  public shared ({ caller }) func removeImageFromNote(
    noteId : Text,
    imageUrl : Text
  ) : async Note {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove images");
    };

    let notes = getUserNotesMap(caller);
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note does not exist") };
      case (?note) {
        let filteredUrls = note.imageUrls.filter(
          func(url) {
            url != imageUrl;
          }
        );
        let updatedNote = {
          note with
          imageUrls = filteredUrls;
        };
        notes.add(noteId, updatedNote);
        updatedNote;
      };
    };
  };
};
