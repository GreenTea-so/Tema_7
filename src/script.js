let statsProject = 0;
let statsUval = 0;
let statsInvite = 0;

let projects = [];

const workers = [];

function getRandom(min, max) {
  const resMin = Math.ceil(min);
  const resMax = Math.floor(max);
  return Math.floor(Math.random() * (resMax - resMin + 1)) + resMin;
}

class Departament {
  constructor(_type) {
    this.type = _type;
    this.free_worker = 0;
    this.itog_project = 0;
  }

  invite() {
    this.free_worker += 1;
  }

  transferProject(_project) {
    for (let i = 0; i < workers.length; i += 1) {
      if (workers[i].getType() === _project.getType() && workers[i].getProject() === undefined) {
        // console.log("aaa")
        workers[i].addProject(_project);
        this.free_worker -= 1;
        break;
      }
    }

    if (this.free_worker > 0) {
      for (let i = 0; i < workers.length; i += 1) {
        if (workers[i].getProject() !== undefined) {
          if (workers[i].getType === 2 && workers[i].getProject().getLvl() === 2 && workers[i].getProject().getQuantity() === 1) {
            for (let j = 0; j < workers.length && workers[i].getProject().getQuantity !== 2; j += 1) {
              if (workers[j].getType === 2 && workers[j].getProject() === undefined) {
                workers[j].addProject(workers[i].getProject());
                workers[i].getProject().cnahgeQuantity(2);
                workers[j].getProject().cnahgeQuantity(2);
                this.free_worker -= 1;
              }
            }
          }

          if (workers[i].getType === 2 && workers[i].getProject().getLvl() === 3 && workers[i].getProject().getQuantity() < 3) {
            for (let j = 0; j < workers.length && workers[i].getProject().getQuantity < 3; j += 1) {
              if (workers[j].getType === 2 && workers[j].getProject() === undefined) {
                workers[j].addProject(workers[i].getProject());
                workers[i].getProject().cnahgeQuantity(0);
                workers[j].getProject().cnahgeQuantity(0);
                this.free_worker -= 1;
              }
            }
          }
        }
      }
    }
  }

  getFreeWorker() {
    return this.free_worker;
  }

  freework() {
    this.free_worker += 1;
  }

  freeworkUn() {
    this.free_worker -= 1;
  }

  getstats() {
    return this.itog_project;
  }

  incstats() {
    this.itog_project += 1;
  }
}
const webDepartament = new Departament(1);
const mobileDepartament = new Departament(2);

function freeWorkWeb() {
  webDepartament.freework();
}

function freeWorkMobile() {
  mobileDepartament.freework();
}

let instanceQA;

class QADepartament {
  constructor(_type) {
    if (!instanceQA) { // паттерн одиночка
      instanceQA = this;
    }

    this.projects = [];
    this.type = _type;

    return instanceQA;
  }

  addProject(_project) {
    this.projects.push(_project);
  }

  getProjects() {
    return this.projects;
  }

  joinDay() {
    for (let i = 0; i < this.projects.length; i += 1) {
      statsProject += 1;
      this.projects.splice(i, 1);
    }
  }
}

const QADep = new QADepartament(3);

class Worker {
  constructor(_type) {
    this.type = _type;
    this.project_stats = 0;
    this.uval_stats = 0;
    this.back_day = -1;
  }

  addProject(_project) {
    this.project = _project;
    this.project.cnahgeQuantity(1);
  }

  getType() {
    return this.type;
  }

  getProject() {
    return this.project;
  }

  joinDay(_day) {
    const uval = getRandom(0, 20);

    // console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUU", uval, this.back_day +1, _day)
    if ((uval > 15 && this.back_day + 1 === _day) || (this.back_day === -1 && uval > 18)) {
      this.uval_stats += 1;
    } else {
      this.uval_stats = 0;
    }
    this.back_day = _day;

    if (this.project.joinDay()) {
      if (this.type === 1) { // паттерн стратегия
        freeWorkWeb();
      }

      if (this.type === 2) {
        freeWorkMobile();
      }
      QADep.addProject(this.project);
      this.project = undefined;
      // stats_project++
      this.project_stats += 1;
    }
  }

  getStatsuval() {
    return this.uval_stats;
  }
}

let sizeIdProject = 0;

class Project {
  constructor(_lvl, _type) {
    this.lvl = _lvl;
    this.type = _type;
    this.id = sizeIdProject;
    sizeIdProject += 1;
    this.quantity_worker = 0;
  }

  getLvl() {
    return this.lvl;
  }

  getType() {
    return this.type;
  }

  joinDay() {
    this.lvl -= 1;

    if (this.lvl <= 0) {
      if (this.type === 1) {
        webDepartament.incstats();
      }
      if (this.type === 2) {
        mobileDepartament.incstats();
      }

      return true;
    }

    return false;
  }

  cnahgeQuantity(_quantity) {
    this.quantity_worker = _quantity;
    if (_quantity === 0) {
      this.quantity_worker += 1;
    }
  }

  getQuantity() {
    return this.quantity_worker;
  }
}

function inviteDirect(departament, sizeInvite) { // паттерн стратегия
  for (let i = 0; i < sizeInvite; i += 1) {
    workers.push(new Worker(1));
    departament.invite();
    statsInvite += 1;
  }
}

let instanceDirect = false;

class Direct {
  constructor() {
    if (!instanceDirect) { // паттерн одиночка
      instanceDirect = this;
    }
    this.invite_worker_web = 0;
    this.invite_worker_mobile = 0;
    return instanceDirect;
  }

  invite() {
    inviteDirect(webDepartament, this.invite_worker_web); // паттерн стратегия
    inviteDirect(mobileDepartament, this.invite_worker_mobile);

    this.invite_worker_web = 0;
    this.invite_worker_mobile = 0;
  }

  unvite() {
    let statsUninvite = 0;
    for (let i = 0; i < workers.length; i += 1) {
      if (workers[i].getStatsuval() >= 3) {
        statsUninvite += 1;
      }
    }

    let day = 0;
    // console.log("uninvite", stats_uninvite, day)
    if (statsUninvite > 0 && day === 0) {
      // console.log("uninvite")
      for (let i = 0; i < workers.length; i += 1) {
        if (workers[i].getStatsuval() >= 3) {
          if (workers[i].getType() === 1) {
            webDepartament.freeworkUn();
          }
          if (workers[i].getType() === 2) {
            mobileDepartament.freeworkUn();
          }
          if (workers[i].getProject() !== undefined) {
            projects.push(workers[i].getProject());
          }
          // console.log("==========================", workers[i])
          workers.splice(i, 1);
          day += 1;
          statsUval += 1;
        }
      }
    }
  }

  getProject() {
    const k = getRandom(0, 4);
    let lvl = 0;
    let dep = 0;
    const arrayTmp = [];

    for (let i = 0; i < k; i += 1) {
      lvl = getRandom(1, 3);
      dep = getRandom(1, 2);
      arrayTmp.push(new Project(lvl, dep));
    }
    return arrayTmp;
  }

  transferProject() {
    for (let i = 0; i < projects.length; i += 1) {
      if (projects[i].getType() === 1) {
        if (webDepartament.getFreeWorker() > 0) {
          // console.log("============================")
          webDepartament.transferProject(projects[i]);
          projects.splice(i, 1);
          // console.log("Projects transfer")
        } else {
          this.invite_worker_web += 1;
        }
      } else if (projects[i].getType() === 2) {
        if (mobileDepartament.getFreeWorker() > 0) {
          // console.log("============================")
          mobileDepartament.transferProject(projects[i]);
          projects.splice(i, 1);
          // console.log("Projects transfer")
        } else {
          this.invite_worker_mobile += 1;
        }
      }
    }
  }
}

const direct = new Direct();

const start = (k) => {
  for (let i = 0; i < k; i += 1) {
    direct.invite();

    projects = projects.concat(direct.getProject());
    direct.unvite();

    direct.transferProject();
    // console.log("DAY:", i+1)
    // console.log("Projects: ", projects.length, workers.length)

    for (let j = 0; j < workers.length; j += 1) {
      // console.log(j, workers[j].getProject(), workers.length)
      if (workers[j].getProject() !== undefined) {
        workers[j].joinDay(i);
        // console.log(j, workers[j].getProject())
      }
    }

    QADep.joinDay();
  }

  // console.log(stats_project, projects.length)
  // console.log(webDepartament.getstats(), mobileDepartament.getstats(), workers)

  console.log('Уволенных сотрудников: ', statsUval);

  // console.log(webDepartament.getFreeWorker())

  // console.log(QADep.getProjects().length)

  console.log('Выполненных проектов: ', statsProject);

  console.log('Принятых сотрудников: ', statsInvite);
};

start(0);
