export const aboutController = {
  index(request, response) {
    const viewData = {
      title: "About REVmetry",
    };
    console.log("about rendering");
    response.render("about-view", viewData);
  },
};
